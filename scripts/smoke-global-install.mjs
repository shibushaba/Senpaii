import { execSync, spawnSync } from "node:child_process";
import { access, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const windows = process.platform === "win32";
const prefix = execSync("npm prefix --global", { encoding: "utf8", shell: windows }).trim();
const binDirectory = windows ? prefix : path.join(prefix, "bin");
const executable = path.join(binDirectory, windows ? "cdk-kit.cmd" : "cdk-kit");

await access(executable);
process.env.PATH = binDirectory + path.delimiter + (process.env.PATH ?? "");

function run(args) {
  const result = spawnSync("cdk-kit", args, { stdio: "inherit", shell: windows });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error("cdk-kit " + args.join(" ") + " failed with exit code " + result.status);
}

const project = path.join(os.tmpdir(), "cdk-kit-smoke-" + process.pid);
const home = path.join(project, "cdk-home");
process.env.CDK_HOME = home;
await mkdir(project, { recursive: true });
try {
  await writeFile(path.join(project, "package.json"), JSON.stringify({
    name: "cdk-kit-smoke-project",
    private: true,
    dependencies: { react: "^19.0.0", vite: "^6.0.0", typescript: "^5.8.0", "@supabase/supabase-js": "^2.0.0", openai: "^5.0.0" }
  }, null, 2));
  run(["--version"]);
  run(["init", project, "--dry-run"]);
  run(["init", project, "--yes"]);

  for (const directory of [
    "experiences", "journal", "lessons/proposed", "lessons/verified", "lessons/rejected",
    "decisions", "workflows", "uat", "incidents", "promotion-queue", "profiles", "quality-gates", "docs"
  ]) {
    const info = await stat(path.join(project, ".cdk", directory));
    if (!info.isDirectory()) throw new Error("Missing CDK directory: " + directory);
  }
  const ignore = await readFile(path.join(project, ".cdk", ".gitignore"), "utf8");
  if (!ignore.includes("/experiences/*") || !ignore.includes("!/experiences/.gitkeep")) {
    throw new Error("CDK project memory ignore policy was not installed correctly.");
  }

  run(["profiles", project]);
  run(["doctor", project]);
  run(["status", project]);
  run(["learn"]);
  run(["knowledge", project, "--query", "delivery"]);
  run(["sync", project]);

  const lessonDir = path.join(project, ".cdk", "lessons", "verified");
  await mkdir(lessonDir, { recursive: true });
  const lesson = path.join(lessonDir, "smoke-lesson.md");
  await writeFile(lesson, `---
id: LES-20261111-001
record_type: lesson
title: Prefer an idempotency key before retrying delivery
status: verified
summary: Retries without a key duplicated outbound messages.
promotion:
  status: not_requested
---

# Prefer an idempotency key before retrying delivery

Store the key before the first send.
`);
  run(["promote", lesson, "--dry-run"]);
  run(["promote", lesson, "--yes"]);
  run(["knowledge", project, "--query", "idempotency", "--global"]);
  const globalLessons = path.join(home, "knowledge", "lessons");
  const promoted = (await readdir(globalLessons)).filter((file) => file.endsWith(".md"));
  if (promoted.length !== 1) throw new Error("promote did not write one global lesson");
  run(["retract", promoted[0].replace(/\.md$/, ""), project, "--yes"]);

  run(["uninstall", project, "--yes"]);
} finally {
  await rm(project, { recursive: true, force: true });
}
