#!/usr/bin/env node
import { Command } from "commander";
import { createHash } from "node:crypto";
import { access, readdir, readFile, writeFile, mkdir, lstat, unlink, rmdir, rename } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ENGINE = "cdk-kit";
const VERSION = "0.1.0";
const MANIFEST_RELATIVE = path.join(".cdk", "cli-manifest.json");
const ASSETS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../assets/project");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
function identity(root) {
  const name = path.basename(path.resolve(root)) || "project";
  const id = name.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
  return { id, name };
}
async function readManifest(root) {
  try {
    const parsed = JSON.parse(await readFile(path.join(root, MANIFEST_RELATIVE), "utf8"));
    if (parsed.schemaVersion !== 1 || parsed.engine !== ENGINE || !parsed.files || typeof parsed.files !== "object") {
      throw new Error("Unsupported or invalid CDK manifest.");
    }
    return parsed;
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}
async function writeManifest(root, manifest) {
  const destination = path.join(root, MANIFEST_RELATIVE);
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = destination + ".tmp";
  await writeFile(temporary, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  try { await rename(temporary, destination); }
  catch (error) { await unlink(temporary).catch(() => undefined); throw error; }
}
async function walk(directory, base = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(full, base));
    else if (entry.isFile()) result.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return result;
}
async function inspectTarget(root, relativePath) {
  let current = root;
  const segments = relativePath.split("/").filter(Boolean);
  for (let i = 0; i < segments.length; i++) {
    current = path.join(current, segments[i]);
    let info;
    try { info = await lstat(current); }
    catch (error) { if (error?.code === "ENOENT") return "missing"; throw error; }
    if (info.isSymbolicLink()) return "blocked";
    if (i < segments.length - 1 && !info.isDirectory()) return "blocked";
    if (i === segments.length - 1) return info.isFile() ? "file" : "blocked";
  }
  return "missing";
}
function targetPath(root, relativePath) {
  const result = path.resolve(root, relativePath.split("/").join(path.sep));
  if (!result.startsWith(root + path.sep)) throw new Error("Unsafe CDK asset path: " + relativePath);
  return result;
}
function renderAsset(relativePath, content, root) {
  if (relativePath === ".cdk/config.yaml") {
    const project = identity(root);
    return content.replaceAll("replace-with-stable-project-slug", project.id)
      .replaceAll("Replace with project name", project.name);
  }
  return content;
}
async function buildPlan(root) {
  const absolute = path.resolve(root);
  const rootInfo = await lstat(absolute);
  if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory()) {
    throw new Error("Target must be an existing, real project directory (not a symlink).");
  }
  const manifest = await readManifest(absolute);
  const managed = manifest?.files ?? {};
  const plan = [];
  for (const relativePath of await walk(ASSETS)) {
    const destination = targetPath(absolute, relativePath);
    const state = await inspectTarget(absolute, relativePath);
    if (state === "blocked") {
      plan.push({ relativePath, action: "skip-conflict", reason: "A path component is a symlink, directory, or non-directory; refusing to follow it." });
      continue;
    }
    const desired = renderAsset(relativePath, await readFile(path.join(ASSETS, relativePath.split("/").join(path.sep)), "utf8"), absolute);
    const record = managed[relativePath];
    if (state === "missing") { plan.push({ relativePath, action: "create" }); continue; }
    const currentHash = sha256(await readFile(destination));
    if (!record) plan.push({ relativePath, action: "skip-conflict", reason: "File exists but is not recorded as CDK-managed." });
    else if (currentHash !== record.sha256) plan.push({ relativePath, action: "skip-modified", reason: "Local file differs from the last CDK-managed version." });
    else if (currentHash === sha256(desired)) plan.push({ relativePath, action: "unchanged" });
    else plan.push({ relativePath, action: "update" });
  }
  return plan;
}
async function applyPlan(root, preview) {
  const absolute = path.resolve(root);
  // Re-plan immediately before writing; local edits made after preview are protected.
  const plan = await buildPlan(absolute);
  const previous = await readManifest(absolute);
  const files = { ...(previous?.files ?? {}) };
  const counts = { created: 0, updated: 0, skipped: 0, unchanged: 0 };
  const now = new Date().toISOString();
  for (const item of plan) {
    if (item.action === "skip-conflict" || item.action === "skip-modified") { counts.skipped++; continue; }
    if (item.action === "unchanged") { counts.unchanged++; continue; }
    const content = renderAsset(item.relativePath,
      await readFile(path.join(ASSETS, item.relativePath.split("/").join(path.sep)), "utf8"), absolute);
    const destination = targetPath(absolute, item.relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, content, "utf8");
    files[item.relativePath] = { sha256: sha256(content), engineVersion: VERSION, installedAt: now };
    if (item.action === "create") counts.created++; else counts.updated++;
  }
  await writeManifest(absolute, {
    schemaVersion: 1, engine: ENGINE, engineVersion: VERSION,
    installedAt: previous?.installedAt ?? now, updatedAt: now,
    project: identity(absolute), files
  });
  return counts;
}
async function uninstallFiles(root) {
  const absolute = path.resolve(root);
  const manifest = await readManifest(absolute);
  if (!manifest) return { removed: 0, preserved: 0 };
  let removed = 0, preserved = 0;
  for (const [relativePath, record] of Object.entries(manifest.files)) {
    const state = await inspectTarget(absolute, relativePath);
    if (state === "blocked") { preserved++; continue; }
    if (state === "missing") continue;
    const destination = targetPath(absolute, relativePath);
    if (sha256(await readFile(destination)) === record.sha256) { await unlink(destination); removed++; }
    else preserved++;
  }
  await unlink(path.join(absolute, MANIFEST_RELATIVE));
  const dirs = new Set();
  for (const relativePath of Object.keys(manifest.files)) {
    let parent = path.dirname(targetPath(absolute, relativePath));
    while (parent.startsWith(absolute + path.sep)) { dirs.add(parent); parent = path.dirname(parent); }
  }
  for (const directory of [...dirs].sort((a, b) => b.length - a.length)) {
    try { await rmdir(directory); } catch { /* Keep non-empty or user-owned directories. */ }
  }
  return { removed, preserved };
}
async function detectProject(root) {
  const markers = [], profiles = new Set();
  const exists = async p => { try { await access(path.join(root, p)); return true; } catch { return false; } };
  if (await exists("package.json")) {
    markers.push("package.json");
    try {
      const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.react || deps.vite) profiles.add("react-typescript");
      if (deps.next) profiles.add("nextjs");
      if (deps["@nestjs/core"]) profiles.add("nestjs");
    } catch { markers.push("package.json (unreadable)"); }
  }
  if (await exists("pyproject.toml")) { markers.push("pyproject.toml"); profiles.add("python"); }
  if (await exists("requirements.txt")) { markers.push("requirements.txt"); profiles.add("python"); }
  if (await exists("manage.py")) profiles.add("django");
  if (await exists("pubspec.yaml")) { markers.push("pubspec.yaml"); profiles.add("flutter-dart"); }
  if (await exists("deno.json") || await exists("deno.jsonc")) { markers.push("deno.json"); profiles.add("deno"); }
  if (await exists("go.mod")) { markers.push("go.mod"); profiles.add("go"); }
  if (await exists("Cargo.toml")) { markers.push("Cargo.toml"); profiles.add("rust"); }
  if (await exists(".cursor")) markers.push(".cursor/ (existing IDE configuration)");
  return { markers, profiles: [...profiles].sort() };
}
async function ask(question) {
  if (!stdin.isTTY || !stdout.isTTY) return false;
  const rl = createInterface({ input: stdin, output: stdout });
  try { return ["y", "yes"].includes((await rl.question(question)).trim().toLowerCase()); }
  finally { rl.close(); }
}
function printPlan(plan) {
  const labels = { create: "CREATE", update: "UPDATE", unchanged: "KEEP", "skip-conflict": "SKIP (user file)", "skip-modified": "SKIP (locally modified)" };
  for (const item of plan) stdout.write("  " + labels[item.action].padEnd(25) + " " + item.relativePath + (item.reason ? " — " + item.reason : "") + "\n");
}
async function init(target = ".", options = {}) {
  const root = path.resolve(target);
  const project = await detectProject(root);
  const plan = await buildPlan(root);
  stdout.write("\nCDK project setup: " + path.basename(root) + "\nProject: " + root +
    "\nDetected profiles: " + (project.profiles.join(", ") || "general") + "\n\n");
  printPlan(plan);
  if (!plan.some(item => item.action === "create" || item.action === "update")) { stdout.write("\nNo file changes are required.\n"); return; }
  if (options.dryRun) { stdout.write("\nDry run only. No files were changed.\n"); return; }
  if (options.yes !== true && !(await ask("Apply this plan? [y/N] "))) {
    stdout.write("\nNothing changed. Re-run with --yes to apply the displayed plan.\n"); return;
  }
  const result = await applyPlan(root, plan);
  stdout.write("\nCDK initialized. Created: " + result.created + ", updated: " + result.updated +
    ", skipped: " + result.skipped + ", unchanged: " + result.unchanged + ".\n");
  stdout.write("Project memory remains local to this repository. No application source files were changed.\n");
}
async function doctor(target = ".") {
  const root = path.resolve(target), project = await detectProject(root);
  const checks = [];
  const major = Number(process.versions.node.split(".")[0]);
  checks.push(["Node.js", major >= 20, "v" + process.versions.node + " (requires >=20)"]);
  checks.push(["Project directory", true, root]);
  try { await access(path.join(root, ".cursor")); checks.push(["Cursor integration", true, ".cursor/ exists"]); }
  catch { checks.push(["Cursor integration", false, "Not initialized; run cdk-kit init"]); }
  const manifest = await readManifest(root);
  checks.push(["CDK manifest", Boolean(manifest), manifest ? "engine " + manifest.engineVersion + ", " + Object.keys(manifest.files).length + " managed files" : "Not installed"]);
  checks.push(["Project profile", true, project.profiles.join(", ") || "general"]);
  stdout.write("CDK Doctor — CLI " + VERSION + "\n\n");
  for (const [label, ok, detail] of checks) stdout.write("[" + (ok ? "PASS" : "WARN") + "] " + label + ": " + detail + "\n");
  if (checks.some(check => !check[1])) process.exitCode = 1;
}
async function status(target = ".") {
  const root = path.resolve(target), project = await detectProject(root), manifest = await readManifest(root);
  stdout.write("CDK CLI: " + VERSION + "\nProject: " + path.basename(root) + "\nPath: " + root +
    "\nProfiles: " + (project.profiles.join(", ") || "general") + "\n");
  if (!manifest) { stdout.write("Status: not initialized (run cdk-kit init)\n"); return; }
  stdout.write("Status: initialized\nInstalled engine: " + manifest.engineVersion + "\nManaged files: " +
    Object.keys(manifest.files).length + "\nLast updated: " + manifest.updatedAt +
    "\nProject memory: isolated in this repository\n");
}
async function uninstall(target = ".", options = {}) {
  const root = path.resolve(target), manifest = await readManifest(root);
  if (!manifest) { stdout.write("No CDK manifest found; nothing to uninstall.\n"); return; }
  if (options.dryRun) { stdout.write("Would inspect and remove up to " + Object.keys(manifest.files).length + " CDK-managed files. Locally modified files would be preserved.\n"); return; }
  if (options.yes !== true && !(await ask("Remove unchanged CDK-managed files? [y/N] "))) {
    stdout.write("Nothing changed. Re-run with --yes to confirm uninstall.\n"); return;
  }
  const result = await uninstallFiles(root);
  stdout.write("Uninstall complete. Removed: " + result.removed + "; preserved local modifications: " +
    result.preserved + ". User-owned files were not touched.\n");
}

const program = new Command();
program.name("cdk-kit").description("Install and manage the Cursor Development Kit in any project").version(VERSION);
program.command("init").description("Preview and initialize CDK in the target project")
  .argument("[path]", "project directory", ".").option("-y, --yes", "apply the displayed plan without prompting")
  .option("--dry-run", "show planned changes without writing files").action(init);
program.command("doctor").description("Check the current project's CDK installation")
  .argument("[path]", "project directory", ".").action(doctor);
program.command("status").description("Show CDK and project profile status")
  .argument("[path]", "project directory", ".").action(status);
program.command("update").description("Safely reconcile CDK-managed files to this CLI version")
  .argument("[path]", "project directory", ".").option("-y, --yes", "apply the displayed plan without prompting")
  .option("--dry-run", "show planned changes without writing files").action(init);
program.command("learn").description("Show the IDE commands for project learning").action(() => {
  stdout.write("CDK learning is performed with your IDE agent, not by the terminal itself.\n\n");
  stdout.write("In Cursor Chat, run /31-learn to capture an experience.\n");
  stdout.write("Then use /33-review-lessons to audit the proposed lesson.\n");
  stdout.write("Global promotion always requires explicit human approval.\n");
});
program.command("uninstall").description("Remove unchanged CDK-managed files from a project")
  .argument("[path]", "project directory", ".").option("-y, --yes", "confirm removal")
  .option("--dry-run", "show what would be inspected without changes").action(uninstall);
program.showHelpAfterError();
program.parseAsync(process.argv).catch(error => {
  console.error("cdk-kit: " + (error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
