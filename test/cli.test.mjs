import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

test("the compiled CLI exposes learning commands and its version", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.scripts.compile, "node ./node_modules/typescript/lib/tsc.js -p tsconfig.json");
  assert.equal(pkg.scripts.prepare, "node ./scripts/prepare.mjs");
  const version = spawnSync(process.execPath, ["dist/cli.js", "--version"], { encoding: "utf8" });
  assert.equal(version.status, 0, version.stderr);
  assert.match(version.stdout, new RegExp(pkg.version.replaceAll(".", "\\.")));
  const help = spawnSync(process.execPath, ["dist/cli.js", "--help"], { encoding: "utf8" });
  assert.equal(help.status, 0, help.stderr);
  for (const command of ["init", "doctor", "status", "profiles", "update", "learn", "knowledge", "promote", "sync", "retract", "uninstall"]) {
    assert.match(help.stdout, new RegExp(`\\b${command}\\b`));
  }
});

test("prepare uses the prebuilt CLI when TypeScript is not installed", () => {
  const root = mkdtempSync(path.join(tmpdir(), "cdk-prepare-"));
  mkdirSync(path.join(root, "dist"));
  writeFileSync(path.join(root, "dist", "cli.js"), "#!/usr/bin/env node\nconsole.log('0.3.2')\n");
  const result = spawnSync(process.execPath, [path.resolve("scripts/prepare.mjs")], {
    cwd: root,
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /prebuilt dist/);
});
