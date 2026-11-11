import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildInstallPlan, applyInstallPlan } from "../dist/lib/installer.js";

const assets = fileURLToPath(new URL("../assets/project/", import.meta.url));

test("first install plans and writes bundled assets with a manifest", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cdk-kit-test-"));
  try {
    const plan = await buildInstallPlan(root, assets);
    assert.ok(plan.length > 0);
    assert.ok(plan.every(item => item.action === "create"));
    const result = await applyInstallPlan(root, plan, assets);
    assert.equal(result.created, plan.length);
    const config = await readFile(path.join(root, ".cdk", "config.yaml"), "utf8");
    assert.ok(config.includes(`project_name: "${path.basename(root)}"`));
    for (const directory of ["experiences", "journal", "lessons/proposed", "lessons/verified", "lessons/rejected", "decisions", "workflows", "uat", "incidents", "promotion-queue"]) {
      const info = await stat(path.join(root, ".cdk", directory));
      assert.ok(info.isDirectory(), `expected .cdk/${directory} to exist`);
    }
    const manifest = JSON.parse(await readFile(path.join(root, ".cdk", "cli-manifest.json"), "utf8"));
    assert.equal(Object.keys(manifest.files).length, plan.length);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("untracked existing files are preserved as conflicts", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cdk-kit-test-"));
  try {
    await mkdir(path.join(root, ".cursor", "rules"), { recursive: true });
    const target = path.join(root, ".cursor", "rules", "00-cdk-kit-core.mdc");
    await writeFile(target, "user-owned");
    const plan = await buildInstallPlan(root, assets);
    const conflict = plan.find(item => item.relativePath === ".cursor/rules/00-cdk-kit-core.mdc");
    assert.equal(conflict?.action, "skip-conflict");
    assert.equal(await readFile(target, "utf8"), "user-owned");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("locally modified managed files are not overwritten on update", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cdk-kit-test-"));
  try {
    const first = await buildInstallPlan(root, assets);
    await applyInstallPlan(root, first, assets);
    const target = path.join(root, ".cursor", "rules", "00-cdk-kit-core.mdc");
    await writeFile(target, "custom local version");
    const second = await buildInstallPlan(root, assets);
    const item = second.find(entry => entry.relativePath === ".cursor/rules/00-cdk-kit-core.mdc");
    assert.equal(item?.action, "skip-modified");
    assert.equal(await readFile(target, "utf8"), "custom local version");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
