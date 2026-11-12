import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { ENGINE_NAME, ENGINE_VERSION } from "./manifest.js";

export const PROFILE_CATALOG = [
  { id: "react-typescript-vite", file: "react-typescript-vite.md", label: "React / TypeScript / Vite" },
  { id: "python-django-fastapi", file: "python-django-fastapi.md", label: "Python / Django / FastAPI" },
  { id: "flutter-dart", file: "flutter-dart.md", label: "Flutter / Dart" },
  { id: "databases-supabase", file: "databases-supabase.md", label: "SQL databases / Supabase" },
  { id: "ai-llm-rag", file: "ai-llm-rag.md", label: "AI / LLM / RAG" },
  { id: "n8n-automation", file: "n8n-automation.md", label: "n8n / Workflow automation" }
] as const;

export const GATE_CATALOG = [
  { id: "feature-completion", file: "feature-completion.md", label: "Feature completion" },
  { id: "security-first-pass", file: "security-first-pass.md", label: "Security first pass" },
  { id: "database-change", file: "database-change.md", label: "Database change" },
  { id: "api-integration", file: "api-integration.md", label: "API integration" },
  { id: "release-readiness", file: "release-readiness.md", label: "Release readiness" },
  { id: "pull-request", file: "pull-request.md", label: "Pull request" },
  { id: "performance", file: "performance.md", label: "Performance" },
  { id: "incident", file: "incident.md", label: "Incident review" }
] as const;

type ProfileId = (typeof PROFILE_CATALOG)[number]["id"];
type GateId = (typeof GATE_CATALOG)[number]["id"];

const UNIVERSAL_GATES: readonly GateId[] = ["feature-completion", "security-first-pass", "pull-request"];

const PROFILE_GATES: Record<ProfileId, readonly GateId[]> = {
  "react-typescript-vite": ["performance", "api-integration", "release-readiness"],
  "python-django-fastapi": ["api-integration", "release-readiness", "performance"],
  "flutter-dart": ["performance", "release-readiness"],
  "databases-supabase": ["database-change", "api-integration"],
  "ai-llm-rag": ["api-integration"],
  "n8n-automation": ["api-integration", "incident", "release-readiness"]
};

const PYTHON_MANIFESTS = ["pyproject.toml", "requirements.txt", "requirements-dev.txt", "Pipfile", "setup.py", "setup.cfg"];
const PYTHON_FRAMEWORK = [/\bdjango\b/, /\bfastapi\b/];
const PYTHON_SQL = [/\bdjango\b/, /\bpsycopg2?\b/, /\basyncpg\b/, /\bsqlalchemy\b/, /\bmysqlclient\b/, /\bpymysql\b/];

export interface ActivatedGate {
  id: GateId;
  file: string;
  label: string;
  status: "active" | "available";
  reason: string;
}

export interface ProjectInfo {
  root: string;
  name: string;
  id: string;
  markers: string[];
  profiles: string[];
  gates: ActivatedGate[];
}

async function exists(filePath: string): Promise<boolean> {
  try { await access(filePath); return true; } catch { return false; }
}

async function includesAny(filePath: string, patterns: RegExp[]): Promise<boolean> {
  try {
    const source = (await readFile(filePath, "utf8")).toLowerCase();
    return patterns.some(pattern => pattern.test(source));
  } catch {
    return false;
  }
}

function gatesForProfile(profileId: string): readonly GateId[] {
  for (const profile of PROFILE_CATALOG) {
    if (profile.id === profileId) return PROFILE_GATES[profile.id];
  }
  return [];
}

export function activateGates(profileIds: readonly string[]): ActivatedGate[] {
  const reasons = new Map<GateId, string[]>();
  for (const id of UNIVERSAL_GATES) reasons.set(id, ["universal"]);
  for (const profileId of [...profileIds].sort()) {
    for (const gateId of gatesForProfile(profileId)) {
      const current = reasons.get(gateId) ?? [];
      current.push(profileId);
      reasons.set(gateId, current);
    }
  }
  return GATE_CATALOG.map(gate => {
    const why = reasons.get(gate.id);
    return {
      id: gate.id,
      file: gate.file,
      label: gate.label,
      status: why ? "active" : "available",
      reason: why ? why.join(", ") : "no matching stack signal"
    };
  });
}

export function renderActivationYaml(info: ProjectInfo): string {
  const lines = [
    "schema_version: 1",
    `engine: ${ENGINE_NAME}`,
    `engine_version: ${JSON.stringify(ENGINE_VERSION)}`,
    `project_id: ${JSON.stringify(info.id)}`,
    `project_name: ${JSON.stringify(info.name)}`,
    "profiles:"
  ];
  for (const profile of PROFILE_CATALOG) {
    const matched = info.profiles.includes(profile.id);
    lines.push(`  - id: ${profile.id}`);
    lines.push(`    label: ${JSON.stringify(profile.label)}`);
    lines.push(`    status: ${matched ? "matched" : "available"}`);
    lines.push(`    file: ${profile.file}`);
  }
  lines.push("gates:");
  for (const gate of info.gates) {
    lines.push(`  - id: ${gate.id}`);
    lines.push(`    label: ${JSON.stringify(gate.label)}`);
    lines.push(`    status: ${gate.status}`);
    lines.push(`    file: ${gate.file}`);
    lines.push(`    reason: ${JSON.stringify(gate.reason)}`);
  }
  lines.push("guidance: Read matched profiles and active gates only. Available files stay installed as reference and do not override repository evidence.");
  return `${lines.join("\n")}\n`;
}

export async function detectProject(projectRoot: string): Promise<ProjectInfo> {
  const root = path.resolve(projectRoot);
  const name = path.basename(root);
  const id = name.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
  const markers: string[] = [];
  const profiles = new Set<ProfileId>();
  let dependencyNames = new Set<string>();

  const packagePath = path.join(root, "package.json");
  if (await exists(packagePath)) {
    markers.push("package.json");
    try {
      const pkg = JSON.parse(await readFile(packagePath, "utf8")) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      dependencyNames = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})].map(item => item.toLowerCase()));
      if (dependencyNames.has("react") && dependencyNames.has("vite") &&
          (dependencyNames.has("typescript") || await exists(path.join(root, "tsconfig.json")))) {
        profiles.add("react-typescript-vite");
      }
    } catch {
      markers.push("package.json (unreadable)");
    }
  }

  let pythonFramework = false;
  let pythonSql = false;
  for (const marker of PYTHON_MANIFESTS) {
    const fullPath = path.join(root, marker);
    if (!(await exists(fullPath))) continue;
    markers.push(marker);
    if (await includesAny(fullPath, PYTHON_FRAMEWORK)) pythonFramework = true;
    if (await includesAny(fullPath, PYTHON_SQL)) pythonSql = true;
  }
  if (await exists(path.join(root, "manage.py"))) {
    markers.push("manage.py");
    pythonFramework = true;
    pythonSql = true;
  }
  if (pythonFramework) profiles.add("python-django-fastapi");
  if (pythonSql) profiles.add("databases-supabase");

  if (await exists(path.join(root, "pubspec.yaml"))) {
    markers.push("pubspec.yaml");
    profiles.add("flutter-dart");
    if (await includesAny(path.join(root, "pubspec.yaml"), [/supabase_flutter/, /sqflite/, /drift:/])) {
      profiles.add("databases-supabase");
    }
  }

  const databaseDependencies = [
    "@supabase/supabase-js", "supabase_flutter", "pg", "postgres", "mysql2",
    "@prisma/client", "prisma", "drizzle-orm", "typeorm", "sequelize", "knex"
  ];
  if (databaseDependencies.some(item => dependencyNames.has(item))) profiles.add("databases-supabase");
  if (await exists(path.join(root, "supabase", "config.toml")) || await exists(path.join(root, "supabase"))) {
    markers.push("supabase/");
    profiles.add("databases-supabase");
  }
  const aiPatterns = [
    /\b(openai|anthropic|google-generativeai|google-genai|groq|langchain|llama-index|chromadb|pinecone)\b/
  ];
  for (const marker of ["requirements.txt", "requirements-dev.txt", "pyproject.toml", "Pipfile", "setup.py", "setup.cfg"]) {
    if (await includesAny(path.join(root, marker), aiPatterns)) profiles.add("ai-llm-rag");
  }
  const aiDependencies = [
    "openai", "anthropic", "@google/genai", "@google/generative-ai", "groq-sdk",
    "langchain", "@langchain/core", "llamaindex", "chromadb", "@pinecone-database/pinecone"
  ];
  if (aiDependencies.some(item => dependencyNames.has(item))) profiles.add("ai-llm-rag");

  if (dependencyNames.has("n8n") || await exists(path.join(root, ".n8n")) || await exists(path.join(root, "n8n"))) {
    profiles.add("n8n-automation");
  }
  if (await exists(path.join(root, "deno.json")) || await exists(path.join(root, "deno.jsonc"))) markers.push("deno.json");
  if (await exists(path.join(root, "go.mod"))) markers.push("go.mod");
  if (await exists(path.join(root, "Cargo.toml"))) markers.push("Cargo.toml");
  if (await exists(path.join(root, ".cursor"))) markers.push(".cursor/ (existing IDE configuration)");

  const matched = [...profiles].sort();
  return { root, name, id, markers, profiles: matched, gates: activateGates(matched) };
}
