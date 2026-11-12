export declare const ENGINE_NAME = "cdk-kit";
export declare const ENGINE_VERSION = "0.3.2";
export declare const MANIFEST_RELATIVE_PATH: string;
export interface ManagedFileRecord {
    sha256: string;
    engineVersion: string;
    installedAt: string;
}
export interface CdkManifest {
    schemaVersion: 1;
    engine: typeof ENGINE_NAME;
    engineVersion: string;
    installedAt: string;
    updatedAt: string;
    project: {
        id: string;
        name: string;
    };
    files: Record<string, ManagedFileRecord>;
}
export declare function projectIdentity(projectRoot: string): {
    id: string;
    name: string;
};
export declare function readManifest(projectRoot: string): Promise<CdkManifest | null>;
export declare function writeManifest(projectRoot: string, manifest: CdkManifest): Promise<void>;
