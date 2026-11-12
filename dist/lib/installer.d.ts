export type PlanAction = "create" | "update" | "unchanged" | "skip-conflict" | "skip-modified";
export interface InstallPlanEntry {
    relativePath: string;
    action: PlanAction;
    reason?: string;
}
export declare function bundledAssetsDir(): string;
export declare function buildInstallPlan(projectRoot: string, assetsDir?: string): Promise<InstallPlanEntry[]>;
export declare function applyInstallPlan(projectRoot: string, _planned: InstallPlanEntry[], assetsDir?: string): Promise<{
    created: number;
    updated: number;
    skipped: number;
    unchanged: number;
}>;
export declare function uninstallManagedFiles(projectRoot: string): Promise<{
    removed: number;
    preserved: number;
}>;
