import { execSync, spawnSync } from "node:child_process";
import { access, mkdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const windows = process.platform === "win32";
const prefix = execSync("npm prefix --global", { encoding: "utf8", shell: windows }).trim();
const binDirectory = windows ? prefix : path.join(prefix, "bin");
const executable = path.join(binDirectory, windows ? "cdk-kit.cmd" : "cdk-kit");

await access(executable);
process.env.PATH = binDirectory + path.delimiter + (process.env.PATH ?? "");

function run(args) {
  const result = spawnSync("cdk-kit", args, {
    stdio: "inherit",
    shell: windows
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error("cdk-kit " + args.join(" ") + " failed with exit code " + result.status);
  }
}

const project = path.join(os.tmpdir(), "cdk-kit-smoke-" + process.pid);
await mkdir(project, { recursive: true });
try {
  run(["--version"]);
  run(["init", project, "--yes"]);
  run(["status", project]);
  run(["uninstall", project, "--yes"]);
} finally {
  await rm(project, { recursive: true, force: true });
}
