import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readdir, readFile, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { detectProject } from "../dist/lib/project.js";

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
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
