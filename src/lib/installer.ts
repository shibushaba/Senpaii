import { createHash } from "node:crypto";
import { readdir, readFile, writeFile, mkdir, lstat, unlink, rmdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ENGINE_VERSION, MANIFEST_RELATIVE_PATH, projectIdentity, readManifest, writeManifest,
  type CdkManifest
} from "./manifest.js";

export type PlanAction = "create" | "update" | "unchanged" | "skip-conflict" | "skip-modified";
export interface InstallPlanEntry { relativePath: string; action: PlanAction; reason?: string }

export function bundledAssetsDir(): string {
  return fileURLToPath(new URL("../../assets/project/", import.meta.url));
}

function sha256(content: Buffer | string): string {
  return createHash("sha256").update(content).digest("hex");
}

async function walkFiles(directory: string, base = directory): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(fullPath, base));
    else if (entry.isFile()) files.push(path.relative(base, fullPath).split(path.sep).join("/"));
  }
  return files;
}

async function inspectDestination(root: string, relativePath: string): Promise<"missing" | "file" | "blocked"> {
  let current = root;
  const segments = relativePath.split("/").filter(Boolean);
  for (let index = 0; index < segments.length; index++) {
    current = path.join(current, segments[index]!);
    let info;
    try { info = await lstat(current); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return "missing";
      throw error;
    }
    if (info.isSymbolicLink()) return "blocked";
    if (index < segments.length - 1 && !info.isDirectory()) return "blocked";
    if (index === segments.length - 1) return info.isFile() ? "file" : "blocked";
  }
  return "missing";
}

function renderAsset(relativePath: string, content: string, projectRoot: string): string {
  if (relativePath === ".cdk/config.yaml") {
    const identity = projectIdentity(projectRoot);
    return content
      .replaceAll("replace-with-stable-project-slug", identity.id)
      .replaceAll("Replace with project name", identity.name);
  }
  return content;
}

function resolveInsideProject(root: string, relativePath: string): string {
  const target = path.resolve(root, relativePath.split("/").join(path.sep));
  if (!target.startsWith(root + path.sep)) throw new Error(`Unsafe managed path: ${relativePath}`);
  return target;
}

export async function buildInstallPlan(projectRoot: string, assetsDir = bundledAssetsDir()): Promise<InstallPlanEntry[]> {
  const root = path.resolve(projectRoot);
  const rootInfo = await lstat(root);
  if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory()) {
    throw new Error("Target must be an existing, real project directory (not a symlink).");
  }
  const manifest = await readManifest(root);
  const managed = manifest?.files ?? {};
  const assets = await walkFiles(assetsDir);
  const plan: InstallPlanEntry[] = [];

  for (const relativePath of assets) {
    const destination = resolveInsideProject(root, relativePath);
    const destinationState = await inspectDestination(root, relativePath);
    if (destinationState === "blocked") {
      plan.push({ relativePath, action: "skip-conflict", reason: "A path component is a symlink, directory, or non-directory; refusing to follow it." });
      continue;
    }
    const sourceContent = await readFile(path.join(assetsDir, relativePath.split("/").join(path.sep)));
    const desiredHash = sha256(renderAsset(relativePath, sourceContent.toString("utf8"), root));
    const currentRecord = managed[relativePath];

    if (destinationState === "missing") {
      plan.push({ relativePath, action: "create" });
      continue;
    }
    const existingHash = sha256(await readFile(destination));
    if (!currentRecord) {
      plan.push({ relativePath, action: "skip-conflict", reason: "File exists but is not recorded as CDK-managed." });
    } else if (existingHash !== currentRecord.sha256) {
      plan.push({ relativePath, action: "skip-modified", reason: "Local file differs from the last CDK-managed version." });
    } else if (existingHash === desiredHash) {
      plan.push({ relativePath, action: "unchanged" });
    } else {
      plan.push({ relativePath, action: "update" });
    }
  }
  return plan;
}

export async function applyInstallPlan(
  projectRoot: string,
  _planned: InstallPlanEntry[],
  assetsDir = bundledAssetsDir()
): Promise<{ created: number; updated: number; skipped: number; unchanged: number }> {
  const root = path.resolve(projectRoot);
  // Re-plan immediately before writing so files changed after the preview are protected.
  const plan = await buildInstallPlan(root, assetsDir);
  const previous = await readManifest(root);
  const files = { ...(previous?.files ?? {}) };
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let unchanged = 0;
  const now = new Date().toISOString();

  for (const item of plan) {
    if (item.action === "skip-conflict" || item.action === "skip-modified") { skipped++; continue; }
    if (item.action === "unchanged") { unchanged++; continue; }

    const source = path.join(assetsDir, item.relativePath.split("/").join(path.sep));
    const destination = resolveInsideProject(root, item.relativePath);
    const raw = await readFile(source, "utf8");
    const content = renderAsset(item.relativePath, raw, root);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, content, "utf8");
    files[item.relativePath] = {
      sha256: sha256(content),
      engineVersion: ENGINE_VERSION,
      installedAt: now
    };
    if (item.action === "create") created++;
    else updated++;
  }

  const manifest: CdkManifest = {
    schemaVersion: 1, engine: "cdk-kit", engineVersion: ENGINE_VERSION,
    installedAt: previous?.installedAt ?? now, updatedAt: now,
    project: projectIdentity(root), files
  };
  await writeManifest(root, manifest);
  return { created, updated, skipped, unchanged };
}

export async function uninstallManagedFiles(projectRoot: string): Promise<{ removed: number; preserved: number }> {
  const root = path.resolve(projectRoot);
  const manifest = await readManifest(root);
  if (!manifest) return { removed: 0, preserved: 0 };
  let removed = 0;
  let preserved = 0;

  for (const [relativePath, record] of Object.entries(manifest.files)) {
    const state = await inspectDestination(root, relativePath);
    if (state === "blocked") { preserved++; continue; }
    if (state === "missing") continue;
    const target = resolveInsideProject(root, relativePath);
    const current = await readFile(target);
    if (sha256(current) === record.sha256) { await unlink(target); removed++; }
    else preserved++;
  }

  await unlink(path.join(root, MANIFEST_RELATIVE_PATH));
  const dirs = new Set<string>();
  for (const relativePath of Object.keys(manifest.files)) {
    let parent = path.dirname(resolveInsideProject(root, relativePath));
    while (parent.startsWith(root + path.sep)) { dirs.add(parent); parent = path.dirname(parent); }
  }
  for (const directory of [...dirs].sort((a, b) => b.length - a.length)) {
    try { await rmdir(directory); } catch { /* Keep non-empty or user-owned directories. */ }
  }
  return { removed, preserved };
}
