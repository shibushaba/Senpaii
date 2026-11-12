import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readdir, readFile, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { detectProject } from "../dist/lib/project.js";
import { ENGINE_VERSION } from "../dist/lib/manifest.js";

const assets = fileURLToPath(new URL("../assets/project/", import.meta.url));

async function names(directory) {
  return new Set(await readdir(path.join(assets, directory)));
}

test("all original CDK v1.0 rules, commands, and skills are present", async () => {
  const rules = await names(".cursor/rules");
  const commands = await names(".cursor/commands");
  const skills = await names(".cursor/skills");

  const originalRules = [
    "00-core-contract.mdc", "01-repository-first.mdc", "02-planning-and-scope.mdc",
    "03-change-discipline.mdc", "04-testing-and-verification.mdc", "05-security-and-data.mdc",
    "06-api-and-integration.mdc", "07-release-and-operations.mdc"
  ];
  const originalCommands = [
    "01-grill.md", "02-read-first.md", "03-plan.md", "04-mvp.md", "05-one-step.md",
    "06-stay-in-scope.md", "07-what-changed.md", "08-remember-this.md", "09-why-not-fix.md",
    "10-explain-error.md", "11-add-logs.md", "12-loop-breaker.md", "13-security.md",
    "14-break-it.md", "15-senior-review.md", "16-architecture.md", "17-api-design.md",
    "18-database-review.md", "19-test-plan.md", "20-write-tests.md", "21-review-diff.md",
    "22-refactor-safely.md", "23-performance.md", "24-dependency-audit.md", "25-docs.md",
    "26-git-ready.md", "27-release-check.md", "28-incident-review.md", "29-migration-plan.md",
    "30-verify.md"
  ];
  const originalSkills = [
    "api-integration", "architecture-design", "code-review", "database-migrations",
    "feature-development", "incident-analysis", "performance-investigation", "project-discovery",
    "release-readiness", "requirements-analysis", "security-review", "systematic-debugging",
    "test-engineering"
  ];

  for (const file of originalRules) assert.ok(rules.has(file), `missing original rule: ${file}`);
  for (const file of originalCommands) assert.ok(commands.has(file), `missing original command: ${file}`);
  for (const skill of originalSkills) {
    const content = await readFile(path.join(assets, ".cursor", "skills", skill, "SKILL.md"), "utf8");
    assert.match(content, new RegExp(`^name: ${skill}$`, "m"));
  }
  assert.equal(originalRules.length, 8);
  assert.equal(originalCommands.length, 30);
  assert.equal(originalSkills.length, 13);
});

test("all six technology profiles, eight quality gates and six toolkit docs are bundled", async () => {
  assert.equal((await names(".cdk/profiles")).size, 6);
  assert.equal((await names(".cdk/quality-gates")).size, 8);
  assert.equal((await names(".cdk/docs")).size, 6);
});

test("profile detection requires repository evidence and reports relevant stacks", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cdk-profile-test-"));
  try {
    await writeFile(path.join(root, "package.json"), JSON.stringify({
      dependencies: {
        react: "^19.0.0",
        vite: "^6.0.0",
        typescript: "^5.8.0",
        "@supabase/supabase-js": "^2.0.0",
        openai: "^5.0.0"
      }
    }));
    const detected = await detectProject(root);
    assert.ok(detected.profiles.includes("react-typescript-vite"));
    assert.ok(detected.profiles.includes("databases-supabase"));
    assert.ok(detected.profiles.includes("ai-llm-rag"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Flutter and n8n profiles are detected only from matching project markers", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cdk-profile-test-"));
  try {
    await writeFile(path.join(root, "pubspec.yaml"), "dependencies:\n  flutter:\n    sdk: flutter\n");
    await mkdir(path.join(root, "n8n"));
    const detected = await detectProject(root);
    assert.ok(detected.profiles.includes("flutter-dart"));
    assert.ok(detected.profiles.includes("n8n-automation"));
    assert.equal(detected.gates.find(gate => gate.id === "incident")?.status, "active");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("learning commands, capture rule, and learning skill are substantive", async () => {
  const commands = await names(".cursor/commands");
  const learningCommands = [
    "00-cdk-init.md", "31-learn.md", "32-knowledge.md", "33-review-lessons.md", "34-promote-lesson.md",
    "35-learn-error.md", "36-learn-workflow.md", "37-learn-decision.md", "38-learn-uat.md",
    "39-learn-incident.md", "40-learning-report.md"
  ];
  for (const file of learningCommands) {
    assert.ok(commands.has(file), `missing learning command: ${file}`);
    const content = await readFile(path.join(assets, ".cursor", "commands", file), "utf8");
    assert.ok(content.length > 500, `${file} is too short to be a real workflow`);
    assert.match(content, /Do not /);
  }
  const rules = await names(".cursor/rules");
  assert.ok(rules.has("08-learning-boundaries.mdc"));
  assert.ok(rules.has("09-proactive-learning.mdc"));
  const proactive = await readFile(path.join(assets, ".cursor", "rules", "09-proactive-learning.mdc"), "utf8");
  assert.match(proactive, /Before acting/);
  assert.match(proactive, /verified/);
  assert.match(proactive, /proposed/);
  const skill = await readFile(path.join(assets, ".cursor", "skills", "cdk-learning", "SKILL.md"), "utf8");
  assert.match(skill, /^name: cdk-learning$/m);
  assert.match(skill, /Never auto-verify or auto-promote/);
});

test("a Python manifest without Django or FastAPI does not select the Python profile", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cdk-profile-test-"));
  try {
    await writeFile(path.join(root, "requirements.txt"), "requests==2.32.0\n");
    const detected = await detectProject(root);
    assert.ok(detected.markers.includes("requirements.txt"));
    assert.equal(detected.profiles.includes("python-django-fastapi"), false);
    assert.equal(detected.profiles.includes("databases-supabase"), false);
    assert.deepEqual(detected.gates.filter(gate => gate.status === "active").map(gate => gate.id), [
      "feature-completion", "security-first-pass", "pull-request"
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("FastAPI evidence selects the Python profile and its gates, and Django also selects SQL", async () => {
  const fastapiRoot = await mkdtemp(path.join(os.tmpdir(), "cdk-profile-test-"));
  const djangoRoot = await mkdtemp(path.join(os.tmpdir(), "cdk-profile-test-"));
  try {
    await writeFile(path.join(fastapiRoot, "requirements.txt"), "fastapi==0.115.0\nuvicorn==0.32.0\n");
    const fastapi = await detectProject(fastapiRoot);
    assert.ok(fastapi.profiles.includes("python-django-fastapi"));
    assert.equal(fastapi.profiles.includes("databases-supabase"), false);
    assert.equal(fastapi.gates.find(gate => gate.id === "api-integration")?.status, "active");
    assert.equal(fastapi.gates.find(gate => gate.id === "database-change")?.status, "available");
    assert.equal(fastapi.gates.find(gate => gate.id === "incident")?.status, "available");

    await writeFile(path.join(djangoRoot, "manage.py"), "#!/usr/bin/env python\n");
    const django = await detectProject(djangoRoot);
    assert.ok(django.profiles.includes("python-django-fastapi"));
    assert.ok(django.profiles.includes("databases-supabase"));
    assert.equal(django.gates.find(gate => gate.id === "database-change")?.status, "active");
  } finally {
    await rm(fastapiRoot, { recursive: true, force: true });
    await rm(djangoRoot, { recursive: true, force: true });
  }
});

test("React without Vite does not match the React profile", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cdk-profile-test-"));
  try {
    await writeFile(path.join(root, "package.json"), JSON.stringify({ dependencies: { react: "^19.0.0", typescript: "^5.8.0" } }));
    const detected = await detectProject(root);
    assert.equal(detected.profiles.includes("react-typescript-vite"), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("published package version, engine, and executable come from the TypeScript build", async () => {
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.version, ENGINE_VERSION);
  assert.equal(pkg.bin["cdk-kit"], "./dist/cli.js");
  const source = await readFile(new URL("../src/cli.ts", import.meta.url), "utf8");
  assert.match(source, /^#!\/usr\/bin\/env node\r?\n/);
  const compiled = await readFile(new URL("../dist/cli.js", import.meta.url), "utf8");
  assert.match(compiled, /^#!\/usr\/bin\/env node\r?\n/);
  await assert.rejects(readFile(new URL("../bin/cdk-kit.js", import.meta.url), "utf8"));
});
