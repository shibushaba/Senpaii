interface InitOptions {
    yes?: boolean;
    dryRun?: boolean;
}
export declare function runInit(target?: string, options?: InitOptions): Promise<void>;
export {};
