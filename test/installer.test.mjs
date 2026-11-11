import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildInstallPlan, applyInstallPlan } from "../dist/lib/installer.js";
import { ENGINE_VERSION } from "../dist/lib/manifest.js";

const assets = fileURLToPath(new URL("../assets/project/", import.meta.url));

test("first install writes complete project memory structure, ignore policy, and manifest", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cdk-kit-test-"));
  try {
    const plan = await buildInstallPlan(root, assets);
    assert.ok(plan.length > 0);
    assert.ok(plan.every(item => item.action === "create"));
    assert.ok(plan.some(item => item.relativePath === ".cdk/.gitignore"));
    const result = await applyInstallPlan(root, plan, assets);
    assert.equal(result.created, plan.length);
    const config = await readFile(path.join(root, ".cdk", "config.yaml"), "utf8");
    assert.ok(config.includes(`project_name: "${path.basename(root)}"`));
    const ignore = await readFile(path.join(root, ".cdk", ".gitignore"), "utf8");
    assert.ok(ignore.includes("/experiences/*"));
    assert.ok(ignore.includes("!/experiences/.gitkeep"));
    assert.ok(ignore.includes("/global-mirror/*"));
    const activation = await readFile(path.join(root, ".cdk", "activation.yaml"), "utf8");
    assert.match(activation, new RegExp(`engine_version: "${ENGINE_VERSION}"`));
    assert.match(activation, /status: available/);
    for (const directory of ["experiences", "journal", "lessons/proposed", "lessons/verified", "lessons/rejected", "decisions", "workflows", "uat", "incidents", "promotion-queue"]) {
      const info = await stat(path.join(root, ".cdk", directory));
      assert.ok(info.isDirectory(), `expected .cdk/${directory} to exist`);
    }
    const manifest = JSON.parse(await readFile(path.join(root, ".cdk", "cli-manifest.json"), "utf8"));
    assert.equal(Object.keys(manifest.files).length, plan.length);
    assert.ok(Object.hasOwn(manifest.files, ".cdk/.gitignore"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("untracked existing files are preserved as conflicts", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cdk-kit-test-"));
  try {
    await mkdir(path.join(root, ".cursor", "rules"), { recursive: true });
    const target = path.join(root, ".cursor", "rules", "00-core-contract.mdc");
    await writeFile(target, "user-owned");
    const plan = await buildInstallPlan(root, assets);
    const conflict = plan.find(item => item.relativePath === ".cursor/rules/00-core-contract.mdc");
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
    const target = path.join(root, ".cursor", "rules", "00-core-contract.mdc");
    await writeFile(target, "custom local version");
    const second = await buildInstallPlan(root, assets);
    const item = second.find(entry => entry.relativePath === ".cursor/rules/00-core-contract.mdc");
    assert.equal(item?.action, "skip-modified");
    assert.equal(await readFile(target, "utf8"), "custom local version");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("activation.yaml refreshes when the detected stack changes and the file is untouched", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cdk-kit-test-"));
  try {
    await applyInstallPlan(root, await buildInstallPlan(root, assets), assets);
    await writeFile(path.join(root, "requirements.txt"), "fastapi==0.115.0\n");
    const plan = await buildInstallPlan(root, assets);
    const activation = plan.find(entry => entry.relativePath === ".cdk/activation.yaml");
    assert.equal(activation?.action, "update");
    await applyInstallPlan(root, plan, assets);
    const text = await readFile(path.join(root, ".cdk", "activation.yaml"), "utf8");
    assert.match(text, /id: python-django-fastapi\n {4}label: .*\n {4}status: matched/);
    assert.match(text, /id: database-change\n {4}label: .*\n {4}status: available/);
    assert.match(text, /id: incident\n {4}label: .*\n {4}status: available/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
