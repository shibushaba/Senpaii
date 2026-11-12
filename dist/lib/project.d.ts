export declare const PROFILE_CATALOG: readonly [{
    readonly id: "react-typescript-vite";
    readonly file: "react-typescript-vite.md";
    readonly label: "React / TypeScript / Vite";
}, {
    readonly id: "python-django-fastapi";
    readonly file: "python-django-fastapi.md";
    readonly label: "Python / Django / FastAPI";
}, {
    readonly id: "flutter-dart";
    readonly file: "flutter-dart.md";
    readonly label: "Flutter / Dart";
}, {
    readonly id: "databases-supabase";
    readonly file: "databases-supabase.md";
    readonly label: "SQL databases / Supabase";
}, {
    readonly id: "ai-llm-rag";
    readonly file: "ai-llm-rag.md";
    readonly label: "AI / LLM / RAG";
}, {
    readonly id: "n8n-automation";
    readonly file: "n8n-automation.md";
    readonly label: "n8n / Workflow automation";
}];
export declare const GATE_CATALOG: readonly [{
    readonly id: "feature-completion";
    readonly file: "feature-completion.md";
    readonly label: "Feature completion";
}, {
    readonly id: "security-first-pass";
    readonly file: "security-first-pass.md";
    readonly label: "Security first pass";
}, {
    readonly id: "database-change";
    readonly file: "database-change.md";
    readonly label: "Database change";
}, {
    readonly id: "api-integration";
    readonly file: "api-integration.md";
    readonly label: "API integration";
}, {
    readonly id: "release-readiness";
    readonly file: "release-readiness.md";
    readonly label: "Release readiness";
}, {
    readonly id: "pull-request";
    readonly file: "pull-request.md";
    readonly label: "Pull request";
}, {
    readonly id: "performance";
    readonly file: "performance.md";
    readonly label: "Performance";
}, {
    readonly id: "incident";
    readonly file: "incident.md";
    readonly label: "Incident review";
}];
type GateId = (typeof GATE_CATALOG)[number]["id"];
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
export declare function activateGates(profileIds: readonly string[]): ActivatedGate[];
export declare function renderActivationYaml(info: ProjectInfo): string;
export declare function detectProject(projectRoot: string): Promise<ProjectInfo>;
export {};
