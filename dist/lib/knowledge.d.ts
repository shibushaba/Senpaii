import { type ProjectConfig } from "./config.js";
export interface KnowledgeHit {
    scope: "project" | "global";
    status: string;
    id: string;
    title: string;
    summary: string;
    relativePath: string;
    score: number;
}
export interface PromoteResult {
    wrote: boolean;
    globalId: string;
    preview: string;
    message: string;
}
export declare function knowledgeHome(override?: string | undefined): string;
export declare function libraryRoot(config: ProjectConfig, home: string): string;
export declare function normalizeTitle(title: string): string;
export declare function findSecrets(content: string): string[];
export declare function redactEmails(content: string): string;
export declare function splitFrontmatter(content: string): {
    raw: string;
    body: string;
    hasFrontmatter: boolean;
};
export declare function frontmatterValue(raw: string, key: string): string | undefined;
export declare function searchKnowledge(options: {
    projectRoot: string;
    query?: string | undefined;
    includeGlobal?: boolean | undefined;
    home?: string | undefined;
    limit?: number | undefined;
}): Promise<KnowledgeHit[]>;
export declare function promoteLesson(options: {
    lessonPath: string;
    yes?: boolean | undefined;
    dryRun?: boolean | undefined;
    allowDuplicate?: boolean | undefined;
    now?: Date | undefined;
    home?: string | undefined;
}): Promise<PromoteResult>;
export declare function syncKnowledge(options: {
    projectRoot: string;
    dryRun?: boolean | undefined;
    home?: string | undefined;
}): Promise<{
    indexed: number;
    mirrored: boolean;
    message: string;
}>;
export declare function retractLesson(id: string, options?: {
    yes?: boolean | undefined;
    dryRun?: boolean | undefined;
    home?: string | undefined;
    now?: Date | undefined;
    projectRoot?: string | undefined;
}): Promise<string>;
export declare const GLOBAL_MIRROR_HEADER = "<!-- generated_by: cdk-kit global-mirror -->";
