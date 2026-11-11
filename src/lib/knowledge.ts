import { createHash } from "node:crypto";
import { readdir, readFile, writeFile, mkdir, lstat, rename, unlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { readProjectConfig, type ProjectConfig } from "./config.js";
import { projectIdentity } from "./manifest.js";

const MIRROR_HEADER = "<!-- generated_by: cdk-kit global-mirror -->";
const MAX_RECORD_BYTES = 200_000;
const PROJECT_RECORD_DIRS = [
  ".cdk/lessons/proposed",
  ".cdk/lessons/verified",
  ".cdk/lessons/rejected",
  ".cdk/decisions",
  ".cdk/workflows",
  ".cdk/experiences",
  ".cdk/incidents",
  ".cdk/uat",
  ".cdk/journal"
];

const SECRET_RULES: Array<{ label: string; pattern: RegExp }> = [
  { label: "private key", pattern: /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/ },
  { label: "cloud access key", pattern: /AKIA[0-9A-Z]{16}/ },
  { label: "bearer token", pattern: /Bearer\s+[A-Za-z0-9\-._~+/]{20,}/ },
  { label: "API token", pattern: /\bsk-[A-Za-z0-9]{20,}\b/ },
  { label: "credential assignment", pattern: /(?:api[_-]?key|secret|password|token|authorization)\s*[:=]\s*['"][^'"]{8,}['"]/i }
];

export interface KnowledgeHit {
  scope: "project" | "global";
  status: string;
  id: string;
  title: string;
  summary: string;
  relativePath: string;
  score: number;
}

export interface PromoteResult {
  wrote: boolean;
  globalId: string;
  preview: string;
  message: string;
}

export function knowledgeHome(override?: string | undefined): string {
  if (override) return path.resolve(override);
  if (process.env.CDK_HOME) return path.resolve(process.env.CDK_HOME);
  return path.join(os.homedir(), ".cdk-kit");
}

export function libraryRoot(config: ProjectConfig, home: string): string {
  if (config.globalPath) return path.resolve(config.globalPath);
  return path.join(home, "knowledge");
}

export function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function findSecrets(content: string): string[] {
  return SECRET_RULES.filter(rule => rule.pattern.test(content)).map(rule => rule.label);
}

export function redactEmails(content: string): string {
  return content.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]");
}

export function splitFrontmatter(content: string): { raw: string; body: string; hasFrontmatter: boolean } {
  const normalized = content.replace(/^\uFEFF/, "");
  if (!normalized.startsWith("---\n")) return { raw: "", body: normalized, hasFrontmatter: false };
  const end = normalized.indexOf("\n---", 4);
  if (end < 0) return { raw: "", body: normalized, hasFrontmatter: false };
  return { raw: normalized.slice(4, end), body: normalized.slice(end + 4), hasFrontmatter: true };
}

export function frontmatterValue(raw: string, key: string): string | undefined {
  const match = new RegExp(`^${key}:\\s*(.*)$`, "m").exec(raw);
  const value = match?.[1]?.trim().replace(/^["']|["']$/g, "");
  return value ? value : undefined;
}

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

async function writeAtomic(filePath: string, content: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.tmp`;
  await writeFile(temporary, content, "utf8");
  try { await rename(temporary, filePath); }
  catch (error) { await unlink(temporary).catch(() => undefined); throw error; }
}

async function findProjectRoot(start: string): Promise<string> {
  let current = path.resolve(start);
  const info = await lstat(current);
  if (info.isSymbolicLink()) throw new Error("Refusing to follow a symlinked lesson or project path.");
  if (!info.isDirectory()) current = path.dirname(current);
  while (true) {
    try {
      const configInfo = await lstat(path.join(current, ".cdk", "config.yaml"));
      if (configInfo.isSymbolicLink()) throw new Error("Refusing to follow a symlinked CDK config.");
      if (configInfo.isFile()) return current;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    const parent = path.dirname(current);
    if (parent === current) throw new Error("Not inside a CDK project (no .cdk/config.yaml).");
    current = parent;
  }
}

async function walkMarkdown(directory: string): Promise<string[]> {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkMarkdown(fullPath));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(fullPath);
  }
  return files;
}

function statusScore(status: string): number {
  if (status === "verified" || status === "approved" || status === "accepted") return 3;
  if (status === "rejected") return -5;
  return 1;
}

function hitFromFile(scope: KnowledgeHit["scope"], filePath: string, relativePath: string, content: string, terms: string[]): KnowledgeHit | null {
  const parsed = splitFrontmatter(content);
  const title = frontmatterValue(parsed.raw, "title")
    ?? content.match(/^#\s+(.+)$/m)?.[1]?.trim()
    ?? path.basename(filePath, ".md");
  const summary = frontmatterValue(parsed.raw, "summary") ?? "";
  const status = frontmatterValue(parsed.raw, "status") ?? "unspecified";
  const id = frontmatterValue(parsed.raw, "id") ?? path.basename(filePath, ".md");
  const haystack = `${title}\n${summary}\n${parsed.body}`.toLowerCase();
  if (terms.length > 0 && !terms.every(term => haystack.includes(term))) return null;
  let score = statusScore(status);
  for (const term of terms) {
    if (title.toLowerCase().includes(term)) score += 5;
    if (summary.toLowerCase().includes(term)) score += 3;
    if (parsed.body.toLowerCase().includes(term)) score += 1;
  }
  return { scope, status, id, title, summary, relativePath, score };
}

async function readRecord(filePath: string): Promise<string | null> {
  const info = await lstat(filePath);
  if (info.isSymbolicLink() || !info.isFile() || info.size > MAX_RECORD_BYTES) return null;
  return readFile(filePath, "utf8");
}

export async function searchKnowledge(options: {
  projectRoot: string;
  query?: string | undefined;
  includeGlobal?: boolean | undefined;
  home?: string | undefined;
  limit?: number | undefined;
}): Promise<KnowledgeHit[]> {
  const root = path.resolve(options.projectRoot);
  const terms = (options.query ?? "").toLowerCase().split(/\s+/).filter(term => term.length > 0);
  const hits: KnowledgeHit[] = [];
  for (const relativeDir of PROJECT_RECORD_DIRS) {
    for (const filePath of await walkMarkdown(path.join(root, relativeDir))) {
      const content = await readRecord(filePath);
      if (content === null) continue;
      const relativePath = path.relative(root, filePath).split(path.sep).join("/");
      const hit = hitFromFile("project", filePath, relativePath, content, terms);
      if (hit) hits.push(hit);
    }
  }

  const config = await readProjectConfig(root);
  if (options.includeGlobal === true || config.globalEnabled) {
    const lessonsDir = path.join(libraryRoot(config, knowledgeHome(options.home)), "lessons");
    for (const filePath of await walkMarkdown(lessonsDir)) {
      const content = await readRecord(filePath);
      if (content === null || findSecrets(content).length > 0) continue;
      const hit = hitFromFile("global", filePath, path.basename(filePath), content, terms);
      if (hit) hits.push(hit);
    }
  }

  hits.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return hits.slice(0, options.limit ?? 20);
}

function promotionBlock(globalId: string, approvedAt: string): string {
  return [
    "promotion:",
    "  status: promoted",
    `  proposal_id: ${globalId}`,
    "  approved_by: local-cli",
    `  approved_at: ${approvedAt}`
  ].join("\n");
}

function withPromotion(content: string, globalId: string, approvedAt: string): string {
  const parsed = splitFrontmatter(content);
  if (!parsed.hasFrontmatter) throw new Error("Lesson is missing YAML frontmatter.");
  const block = promotionBlock(globalId, approvedAt);
  const raw = /^promotion:\s*$/m.test(parsed.raw)
    ? parsed.raw.replace(/^promotion:\n(?:  .*\n?)*/m, `${block}\n`)
    : `${parsed.raw.replace(/\s*$/, "\n")}${block}\n`;
  return `---\n${raw}---${parsed.body.startsWith("\n") ? parsed.body : `\n${parsed.body}`}`;
}

async function nextGlobalId(library: string, now: Date): Promise<string> {
  const day = now.toISOString().slice(0, 10).replaceAll("-", "");
  const prefix = `GLB-${day}-`;
  let max = 0;
  for (const folder of ["lessons", "archive"]) {
    let names: string[] = [];
    try { names = await readdir(path.join(library, folder)); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    for (const name of names) {
      if (!name.startsWith(prefix) || !name.endsWith(".md")) continue;
      const value = Number(name.slice(prefix.length, -3));
      if (Number.isInteger(value)) max = Math.max(max, value);
    }
  }
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

async function existingGlobalTitles(library: string): Promise<Map<string, string>> {
  const found = new Map<string, string>();
  for (const filePath of await walkMarkdown(path.join(library, "lessons"))) {
    const content = await readRecord(filePath);
    if (!content) continue;
    const parsed = splitFrontmatter(content);
    const title = frontmatterValue(parsed.raw, "title");
    const id = frontmatterValue(parsed.raw, "id") ?? path.basename(filePath, ".md");
    if (title) found.set(normalizeTitle(title), id);
  }
  return found;
}

function renderGlobalLesson(input: {
  globalId: string;
  title: string;
  summary: string;
  sourceLessonId: string;
  sourceProjectId: string;
  sourceRelativePath: string;
  promotedAt: string;
  body: string;
}): string {
  const lines = [
    "---",
    `id: ${input.globalId}`,
    "record_type: global_lesson",
    "status: approved",
    "scope: global",
    `title: ${JSON.stringify(input.title)}`,
    `summary: ${JSON.stringify(input.summary)}`,
    `source_lesson_id: ${input.sourceLessonId}`,
    `source_project_id: ${JSON.stringify(input.sourceProjectId)}`,
    `source_relative_path: ${JSON.stringify(input.sourceRelativePath)}`,
    `promoted_at: ${input.promotedAt}`,
    "---",
    "",
    `Promoted from project \`${input.sourceProjectId}\` lesson \`${input.sourceLessonId}\`. Advisory only. Confirm it against the current repository before applying it.`,
    "",
    input.body.trim(),
    ""
  ];
  return lines.join("\n");
}

export async function promoteLesson(options: {
  lessonPath: string;
  yes?: boolean | undefined;
  dryRun?: boolean | undefined;
  allowDuplicate?: boolean | undefined;
  now?: Date | undefined;
  home?: string | undefined;
}): Promise<PromoteResult> {
  const resolved = path.resolve(options.lessonPath);
  const lessonInfo = await lstat(resolved).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") throw new Error(`Lesson not found: ${options.lessonPath}`);
    throw error;
  });
  if (lessonInfo.isSymbolicLink() || !lessonInfo.isFile()) throw new Error("The lesson must be a regular file.");
  const root = await findProjectRoot(resolved);
  const relativePath = path.relative(root, resolved).split(path.sep).join("/");
  if (relativePath.startsWith("..") || !relativePath.startsWith(".cdk/lessons/verified/") || !relativePath.endsWith(".md")) {
    throw new Error("Only a lesson with status: verified inside .cdk/lessons/verified/ can be promoted.");
  }
  const original = await readFile(resolved, "utf8");
  const parsed = splitFrontmatter(original);
  const status = frontmatterValue(parsed.raw, "status");
  if (status !== "verified") {
    throw new Error("Only a lesson with status: verified inside .cdk/lessons/verified/ can be promoted.");
  }
  const secrets = findSecrets(original);
  if (secrets.length > 0) {
    throw new Error(`Refused to promote a lesson that looks like it contains a ${secrets.join(", ")}. Remove it and try again.`);
  }
  const title = frontmatterValue(parsed.raw, "title");
  if (!title) throw new Error("The lesson needs a title before it can be promoted.");
  const summary = frontmatterValue(parsed.raw, "summary")
    ?? parsed.body.split("\n").map(line => line.trim()).find(line => line && !line.startsWith("#"))
    ?? title;
  const sourceLessonId = frontmatterValue(parsed.raw, "id") ?? path.basename(resolved, ".md");
  const config = await readProjectConfig(root);
  const home = knowledgeHome(options.home);
  const library = libraryRoot(config, home);
  const duplicate = (await existingGlobalTitles(library)).get(normalizeTitle(title));
  if (duplicate && options.allowDuplicate !== true) {
    throw new Error(`A global lesson already uses this title (${duplicate}). Re-run with --allow-duplicate if the new lesson is intentionally distinct.`);
  }
  const now = options.now ?? new Date();
  const globalId = await nextGlobalId(library, now);
  const promotedAt = now.toISOString();
  const globalBody = renderGlobalLesson({
    globalId,
    title: redactEmails(title),
    summary: redactEmails(summary).slice(0, 400),
    sourceLessonId,
    sourceProjectId: projectIdentity(root).id,
    sourceRelativePath: relativePath,
    promotedAt,
    body: redactEmails(parsed.body)
  });
  const preview = `Global id: ${globalId}\nDestination: ${path.join(library, "lessons", `${globalId}.md`)}\n\n${globalBody}`;
  if (options.dryRun === true || options.yes !== true) {
    const next = options.dryRun === true
      ? "Dry run only. No files were changed."
      : "Nothing changed. Re-run with --yes to approve this exact lesson.";
    return { wrote: false, globalId, preview, message: `${preview}\n\n${next}\n` };
  }
  await writeAtomic(path.join(library, "lessons", `${globalId}.md`), globalBody);
  await writeAtomic(resolved, withPromotion(original, globalId, promotedAt));
  await writeAtomic(path.join(library, "promotions", `${globalId}.json`), `${JSON.stringify({
    action: "promote",
    globalId,
    sourceLessonId,
    sourceProjectId: projectIdentity(root).id,
    sourceRelativePath: relativePath,
    sha256: sha256(globalBody),
    promotedAt
  }, null, 2)}\n`);
  await writeLibraryIndex(library);
  return {
    wrote: true,
    globalId,
    preview,
    message: `Promoted ${sourceLessonId} as ${globalId}. The project copy is marked promoted. Global knowledge stays advisory.\n`
  };
}

async function writeLibraryIndex(library: string): Promise<number> {
  const lessons: Array<{ id: string; title: string; summary: string; file: string; sha256: string }> = [];
  for (const filePath of (await walkMarkdown(path.join(library, "lessons"))).sort()) {
    const content = await readRecord(filePath);
    if (!content || findSecrets(content).length > 0) continue;
    const parsed = splitFrontmatter(content);
    lessons.push({
      id: frontmatterValue(parsed.raw, "id") ?? path.basename(filePath, ".md"),
      title: frontmatterValue(parsed.raw, "title") ?? path.basename(filePath, ".md"),
      summary: frontmatterValue(parsed.raw, "summary") ?? "",
      file: path.basename(filePath),
      sha256: sha256(content)
    });
  }
  await writeAtomic(path.join(library, "index.json"), `${JSON.stringify({ schemaVersion: 1, lessons }, null, 2)}\n`);
  return lessons.length;
}

export async function syncKnowledge(options: {
  projectRoot: string;
  dryRun?: boolean | undefined;
  home?: string | undefined;
}): Promise<{ indexed: number; mirrored: boolean; message: string }> {
  const root = path.resolve(options.projectRoot);
  const config = await readProjectConfig(root);
  const library = libraryRoot(config, knowledgeHome(options.home));
  const lessons: Array<{ id: string; title: string; summary: string }> = [];
  let skipped = 0;
  for (const filePath of (await walkMarkdown(path.join(library, "lessons"))).sort()) {
    const content = await readRecord(filePath);
    if (!content) continue;
    if (findSecrets(content).length > 0) { skipped += 1; continue; }
    const parsed = splitFrontmatter(content);
    lessons.push({
      id: frontmatterValue(parsed.raw, "id") ?? path.basename(filePath, ".md"),
      title: frontmatterValue(parsed.raw, "title") ?? path.basename(filePath, ".md"),
      summary: frontmatterValue(parsed.raw, "summary") ?? ""
    });
  }
  const mirrorLines = [
    MIRROR_HEADER,
    "# Approved global lessons",
    "",
    "Advisory only. These summaries were copied from the local global library by `cdk-kit sync`.",
    ""
  ];
  for (const lesson of lessons) {
    mirrorLines.push(`## ${lesson.id} — ${lesson.title}`, "", lesson.summary || "(no summary)", "", "`status: approved`", "");
  }
  if (lessons.length === 0) mirrorLines.push("No approved global lessons are indexed.", "");
  const mirror = `${mirrorLines.join("\n")}\n`;
  if (options.dryRun === true) {
    return {
      indexed: lessons.length,
      mirrored: false,
      message: `Would index ${lessons.length} global lesson(s)${skipped ? ` and skip ${skipped} that look like they contain a credential` : ""}. ${config.globalEnabled ? "Would refresh .cdk/global-mirror/INDEX.md." : "Project global knowledge is disabled; no project files would change."}\n`
    };
  }
  await writeLibraryIndex(library);
  if (!config.globalEnabled) {
    return {
      indexed: lessons.length,
      mirrored: false,
      message: `Indexed ${lessons.length} global lesson(s)${skipped ? `; skipped ${skipped} that look like they contain a credential` : ""}. Project global knowledge is disabled; no project files were changed.\n`
    };
  }
  await writeAtomic(path.join(root, ".cdk", "global-mirror", "INDEX.md"), mirror);
  return {
    indexed: lessons.length,
    mirrored: true,
    message: `Indexed ${lessons.length} global lesson(s)${skipped ? `; skipped ${skipped} that look like they contain a credential` : ""} and refreshed .cdk/global-mirror/INDEX.md.\n`
  };
}

export async function retractLesson(id: string, options: {
  yes?: boolean | undefined;
  dryRun?: boolean | undefined;
  home?: string | undefined;
  now?: Date | undefined;
  projectRoot?: string | undefined;
} = {}): Promise<string> {
  if (!/^GLB-[0-9]{8}-[0-9]{3}$/.test(id)) throw new Error("Global lesson ids look like GLB-YYYYMMDD-001.");
  const projectRoot = path.resolve(options.projectRoot ?? ".");
  const config = await readProjectConfig(projectRoot);
  const library = libraryRoot(config, knowledgeHome(options.home));
  const source = path.join(library, "lessons", `${id}.md`);
  const destination = path.join(library, "archive", `${id}.md`);
  let info;
  try { info = await lstat(source); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") throw new Error(`No approved global lesson ${id}.`);
    throw error;
  }
  if (info.isSymbolicLink() || !info.isFile()) throw new Error(`Refusing to retract ${id} because it is not a regular file.`);
  try {
    await lstat(destination);
    throw new Error(`Archive already contains ${id}.`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  if (options.dryRun === true) return `Would move ${id} from the global library into the local archive.\n`;
  if (options.yes !== true) return "Nothing changed. Re-run with --yes to retract this global lesson.\n";
  await mkdir(path.dirname(destination), { recursive: true });
  await rename(source, destination);
  const retractedAt = (options.now ?? new Date()).toISOString();
  await writeAtomic(path.join(library, "promotions", `retract-${id}.json`), `${JSON.stringify({ action: "retract", globalId: id, retractedAt }, null, 2)}\n`);
  await writeLibraryIndex(library);
  return `Retracted ${id}. It is no longer returned by search. The previous file is in the local archive.\n`;
}

export const GLOBAL_MIRROR_HEADER = MIRROR_HEADER;
