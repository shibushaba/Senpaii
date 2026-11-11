import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("the compiled CLI exposes learning commands and its version", () => {
  const version = spawnSync(process.execPath, ["dist/cli.js", "--version"], { encoding: "utf8" });
  assert.equal(version.status, 0, version.stderr);
  assert.match(version.stdout, /0\.3\.0/);
  const help = spawnSync(process.execPath, ["dist/cli.js", "--help"], { encoding: "utf8" });
  assert.equal(help.status, 0, help.stderr);
  for (const command of ["init", "doctor", "status", "profiles", "update", "learn", "knowledge", "promote", "sync", "retract", "uninstall"]) {
    assert.match(help.stdout, new RegExp(`\\b${command}\\b`));
  }
});
