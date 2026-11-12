import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import path from "node:path";
import { buildInstallPlan, applyInstallPlan } from "../lib/installer.js";
import { detectProject } from "../lib/project.js";
function printPlan(plan) {
    for (const item of plan) {
        const label = { create: "CREATE", update: "UPDATE", unchanged: "KEEP",
            "skip-conflict": "SKIP (user file)", "skip-modified": "SKIP (locally modified)" }[item.action];
        stdout.write(`  ${label.padEnd(25)} ${item.relativePath}${item.reason ? ` — ${item.reason}` : ""}\n`);
    }
}
async function confirm() {
    if (!stdin.isTTY || !stdout.isTTY)
        return false;
    const rl = createInterface({ input: stdin, output: stdout });
    try {
        return ["y", "yes"].includes((await rl.question("Apply this plan? [y/N] ")).trim().toLowerCase());
    }
    finally {
        rl.close();
    }
}
export async function runInit(target = ".", options = {}) {
    const root = path.resolve(target);
    const project = await detectProject(root);
    const plan = await buildInstallPlan(root);
    stdout.write(`\nCDK project setup: ${project.name}\nProject: ${root}\nDetected profiles: ${project.profiles.join(", ") || "none (general guidance)"}\n`);
    const activeGates = project.gates.filter(gate => gate.status === "active").map(gate => gate.id);
    stdout.write(`Active quality gates: ${activeGates.join(", ")}\n\n`);
    printPlan(plan);
    const actionable = plan.some(item => item.action === "create" || item.action === "update");
    if (!actionable) {
        stdout.write("\nNo file changes are required.\n");
        return;
    }
    if (options.dryRun) {
        stdout.write("\nDry run only. No files were changed.\n");
        return;
    }
    const approved = options.yes === true || await confirm();
    if (!approved) {
        stdout.write("\nNothing changed. Re-run with --yes to apply the displayed plan.\n");
        return;
    }
    const result = await applyInstallPlan(root, plan);
    stdout.write(`\nCDK initialized. Created: ${result.created}, updated: ${result.updated}, skipped: ${result.skipped}, unchanged: ${result.unchanged}.\n`);
    stdout.write("Project memory remains local to this repository. No application source files were changed.\n");
}
//# sourceMappingURL=init.js.map