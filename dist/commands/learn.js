import { stdout } from "node:process";
const IDE_COMMANDS = [
    "/00-cdk-init — inspect project memory and surface lessons for this stack",
    "/31-learn — capture the current session",
    "/32-knowledge — search project memory before acting",
    "/33-review-lessons — audit a proposed lesson",
    "/34-promote-lesson — prepare a global proposal without publishing it",
    "/35-learn-error — record a failure and the attempts that did not work",
    "/36-learn-workflow — record a procedure that succeeded",
    "/37-learn-decision — record a choice and the alternatives",
    "/38-learn-uat — record acceptance feedback",
    "/39-learn-incident — record an incident without blame or secrets",
    "/40-learning-report — summarize what this project has learned"
];
export function runLearn() {
    stdout.write("CDK keeps project memory inside the repository and a separate global library on this machine.\n");
    stdout.write("Capture writes proposed records. Verification and promotion stay explicit.\n\n");
    stdout.write("Cursor commands:\n");
    for (const line of IDE_COMMANDS)
        stdout.write(`  ${line}\n`);
    stdout.write("\nTerminal commands, local files only:\n");
    stdout.write("  cdk-kit knowledge --query \"<terms>\"\n");
    stdout.write("  cdk-kit knowledge --query \"<terms>\" --global\n");
    stdout.write("  cdk-kit promote .cdk/lessons/verified/<lesson>.md --dry-run\n");
    stdout.write("  cdk-kit promote .cdk/lessons/verified/<lesson>.md --yes\n");
    stdout.write("  cdk-kit sync\n");
    stdout.write("  cdk-kit retract GLB-YYYYMMDD-001 --yes\n");
    stdout.write("\nA lesson becomes global only after promote --yes. There is no network sync.\n");
}
//# sourceMappingURL=learn.js.map