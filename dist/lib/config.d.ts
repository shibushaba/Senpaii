export interface ProjectConfig {
    globalEnabled: boolean;
    globalPath: string | null;
}
export declare function readProjectConfig(projectRoot: string): Promise<ProjectConfig>;
