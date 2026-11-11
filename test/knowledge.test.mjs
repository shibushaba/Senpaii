import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promoteLesson, retractLesson, searchKnowledge, syncKnowledge } from "../dist/lib/knowledge.js";
import { applyInstallPlan, buildInstallPlan, uninstallManagedFiles } from "../dist/lib/installer.js";
import { fileURLToPath } from "node:url";

const assets = fileURLToPath(new URL("../assets/project/", import.meta.url));

const lessonBody = `---
id: LES-20261111-001
record_type: lesson
title: Use a xylophone-protocol before retrying delivery
status: verified
scope: project
created_at: 2026-11-11T00:00:00Z
project_id: sample
summary: Retrying delivery without an idempotency key duplicated messages.
confidence: high
promotion:
  status: not_requested
  proposal_id: null
  approved_by: null
  approved_at: null
---

# Use a xylophone-protocol before retrying delivery

Classify the provider response before retrying. Contact ops@example.com only after the key is stored.
`;

async function projectWithLesson(root, status = "verified") {
  await mkdir(path.join(root, ".cdk", "lessons", "verified"), { recursive: true });
  await mkdir(path.join(root, ".cdk", "lessons", "proposed"), { recursive: true });
  await writeFile(path.join(root, ".cdk", "config.yaml"), "global_knowledge:\n  enabled: false\n  path: null\n");
  const relative = status === "verified"
    ? path.join(".cdk", "lessons", "verified", "delivery.md")
    : path.join(".cdk", "lessons", "proposed", "delivery.md");
  const file = path.join(root, relative);
  await writeFile(file, lessonBody.replace("status: verified", `status: ${status}`));
  return file;
}

test("promotion stays local, requires approval, and does not leak into another project", async () => {
  const home = await mkdtemp(path.join(os.tmpdir(), "cdk-home-"));
  const projectA = await mkdtemp(path.join(os.tmpdir(), "cdk-project-a-"));
  const projectB = await mkdtemp(path.join(os.tmpdir(), "cdk-project-b-"));
  const now = new Date("2026-11-11T03:00:00.000Z");
  try {
    const lesson = await projectWithLesson(projectA);
    await mkdir(path.join(projectB, ".cdk"), { recursive: true });
    await writeFile(path.join(projectB, ".cdk", "config.yaml"), "global_knowledge:\n  enabled: false\n  path: null\n");
    const preview = await promoteLesson({ lessonPath: lesson, dryRun: true, home, now });
    assert.equal(preview.wrote, false);
    assert.equal(preview.globalId, "GLB-20261111-001");
    await assert.rejects(readFile(path.join(home, "knowledge", "lessons", "GLB-20261111-001.md"), "utf8"));

    const promoted = await promoteLesson({ lessonPath: lesson, yes: true, home, now });
    assert.equal(promoted.wrote, true);
    const globalLesson = await readFile(path.join(home, "knowledge", "lessons", "GLB-20261111-001.md"), "utf8");
    assert.match(globalLesson, /\[redacted-email\]/);
    assert.doesNotMatch(globalLesson, /ops@example.com/);
    const updated = await readFile(lesson, "utf8");
    assert.match(updated, /^status: verified$/m);
    assert.match(updated, /status: promoted/);

    const privateHits = await searchKnowledge({ projectRoot: projectB, query: "xylophone-protocol", home });
    assert.equal(privateHits.length, 0);
    const globalHits = await searchKnowledge({ projectRoot: projectB, query: "xylophone-protocol", includeGlobal: true, home });
    assert.equal(globalHits.length, 1);
    assert.equal(globalHits[0].scope, "global");
    assert.equal(globalHits[0].status, "approved");

    await assert.rejects(
      promoteLesson({ lessonPath: lesson, yes: true, home, now }),
      /already uses this title/
    );

    const syncDisabled = await syncKnowledge({ projectRoot: projectB, home });
    assert.equal(syncDisabled.mirrored, false);
    await assert.rejects(readFile(path.join(projectB, ".cdk", "global-mirror", "INDEX.md"), "utf8"));

    await writeFile(path.join(projectB, ".cdk", "config.yaml"), "global_knowledge:\n  enabled: true\n  path: null\n");
    const syncEnabled = await syncKnowledge({ projectRoot: projectB, home });
    assert.equal(syncEnabled.mirrored, true);
    const mirror = await readFile(path.join(projectB, ".cdk", "global-mirror", "INDEX.md"), "utf8");
    assert.match(mirror, /xylophone-protocol/);
    assert.doesNotMatch(mirror, /ops@example.com/);

    const retracted = await retractLesson("GLB-20261111-001", { yes: true, home, projectRoot: projectB });
    assert.match(retracted, /Retracted/);
    const after = await searchKnowledge({ projectRoot: projectB, query: "xylophone-protocol", includeGlobal: true, home });
    assert.equal(after.length, 0);
    await readFile(path.join(home, "knowledge", "archive", "GLB-20261111-001.md"), "utf8");
  } finally {
    await rm(home, { recursive: true, force: true });
    await rm(projectA, { recursive: true, force: true });
    await rm(projectB, { recursive: true, force: true });
  }
});

test("proposed lessons and credential-bearing lessons cannot be promoted", async () => {
  const home = await mkdtemp(path.join(os.tmpdir(), "cdk-home-"));
  const root = await mkdtemp(path.join(os.tmpdir(), "cdk-project-"));
  try {
    const proposed = await projectWithLesson(root, "proposed");
    await assert.rejects(promoteLesson({ lessonPath: proposed, yes: true, home }), /status: verified/);

    const verified = await projectWithLesson(root, "verified");
    await writeFile(verified, `${lessonBody}\napi_key: "supersecretvalue"\n`);
    await assert.rejects(promoteLesson({ lessonPath: verified, yes: true, home }), /credential assignment/);
    await assert.rejects(readFile(path.join(home, "knowledge", "lessons"), "utf8"));
  } finally {
    await rm(home, { recursive: true, force: true });
    await rm(root, { recursive: true, force: true });
  }
});

test("uninstall removes a generated global mirror and leaves the user library alone", async () => {
  const home = await mkdtemp(path.join(os.tmpdir(), "cdk-home-"));
  const root = await mkdtemp(path.join(os.tmpdir(), "cdk-project-"));
  try {
    await applyInstallPlan(root, await buildInstallPlan(root, assets), assets);
    const lesson = path.join(root, ".cdk", "lessons", "verified", "delivery.md");
    await mkdir(path.dirname(lesson), { recursive: true });
    await writeFile(lesson, lessonBody);
    await promoteLesson({ lessonPath: lesson, yes: true, home, now: new Date("2026-11-11T03:00:00.000Z") });
    let config = await readFile(path.join(root, ".cdk", "config.yaml"), "utf8");
    config = config.replace("enabled: false", "enabled: true");
    await writeFile(path.join(root, ".cdk", "config.yaml"), config);
    await syncKnowledge({ projectRoot: root, home });
    const mirror = await readFile(path.join(root, ".cdk", "global-mirror", "INDEX.md"), "utf8");
    assert.match(mirror, /generated_by: cdk-kit global-mirror/);
    await uninstallManagedFiles(root);
    await assert.rejects(readFile(path.join(root, ".cdk", "global-mirror", "INDEX.md"), "utf8"));
    const kept = await readFile(path.join(home, "knowledge", "lessons", "GLB-20261111-001.md"), "utf8");
    assert.match(kept, /xylophone-protocol/);
  } finally {
    await rm(home, { recursive: true, force: true });
    await rm(root, { recursive: true, force: true });
  }
});
