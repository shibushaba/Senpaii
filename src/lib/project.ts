import { access, readFile } from "node:fs/promises";
import path from "node:path";

export const PROFILE_CATALOG = [
  { id: "react-typescript-vite", file: "react-typescript-vite.md", label: "React / TypeScript / Vite" },
  { id: "python-django-fastapi", file: "python-django-fastapi.md", label: "Python / Django / FastAPI" },
  { id: "flutter-dart", file: "flutter-dart.md", label: "Flutter / Dart" },
  { id: "databases-supabase", file: "databases-supabase.md", label: "SQL databases / Supabase" },
  { id: "ai-llm-rag", file: "ai-llm-rag.md", label: "AI / LLM / RAG" },
  { id: "n8n-automation", file: "n8n-automation.md", label: "n8n / Workflow automation" }
] as const;

export interface ProjectInfo {
  root: string;
  name: string;
  id: string;
  markers: string[];
  profiles: string[];
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

export async function detectProject(projectRoot: string): Promise<ProjectInfo> {
  const root = path.resolve(projectRoot);
  const name = path.basename(root);
  const id = name.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
  const markers: string[] = [];
  const profiles = new Set<string>();
  let dependencyNames = new Set<string>();

  const packagePath = path.join(root, "package.json");
  if (await exists(packagePath)) {
    markers.push("package.json");
    try {
      const pkg = JSON.parse(await readFile(packagePath, "utf8")) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      dependencyNames = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})].map(name => name.toLowerCase()));
      if (dependencyNames.has("react") && dependencyNames.has("vite") &&
          (dependencyNames.has("typescript") || await exists(path.join(root, "tsconfig.json")))) {
        profiles.add("react-typescript-vite");
      }
    } catch {
      markers.push("package.json (unreadable)");
    }
  }

  const pythonMarkers = ["pyproject.toml", "requirements.txt", "requirements-dev.txt", "Pipfile"];
  for (const marker of pythonMarkers) {
    if (await exists(path.join(root, marker))) {
      markers.push(marker);
      profiles.add("python-django-fastapi");
    }
  }
  if (await exists(path.join(root, "manage.py"))) profiles.add("python-django-fastapi");
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
  if (databaseDependencies.some(name => dependencyNames.has(name))) profiles.add("databases-supabase");
  if (await exists(path.join(root, "supabase", "config.toml")) || await exists(path.join(root, "supabase"))) {
    markers.push("supabase/");
    profiles.add("databases-supabase");
  }
  if (await includesAny(path.join(root, "requirements.txt"), [
    /\b(openai|anthropic|google-generativeai|google-genai|groq|langchain|llama-index|chromadb|pinecone)\b/
  ]) || await includesAny(path.join(root, "pyproject.toml"), [
    /\b(openai|anthropic|google-generativeai|google-genai|groq|langchain|llama-index|chromadb|pinecone)\b/
  ])) profiles.add("ai-llm-rag");
  const aiDependencies = [
    "openai", "anthropic", "@google/genai", "@google/generative-ai", "groq-sdk",
    "langchain", "@langchain/core", "llamaindex", "chromadb", "@pinecone-database/pinecone"
  ];
  if (aiDependencies.some(name => dependencyNames.has(name))) profiles.add("ai-llm-rag");

  if (dependencyNames.has("n8n") || await exists(path.join(root, ".n8n")) || await exists(path.join(root, "n8n"))) {
    profiles.add("n8n-automation");
  }
  if (await exists(path.join(root, "deno.json")) || await exists(path.join(root, "deno.jsonc"))) markers.push("deno.json");
  if (await exists(path.join(root, "go.mod"))) markers.push("go.mod");
  if (await exists(path.join(root, "Cargo.toml"))) markers.push("Cargo.toml");
  if (await exists(path.join(root, ".cursor"))) markers.push(".cursor/ (existing IDE configuration)");

  return { root, name, id, markers, profiles: [...profiles].sort() };
}
