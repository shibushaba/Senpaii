#!/usr/bin/env node
import { Command } from "commander";
import { runInit } from "./commands/init.js";
import { runDoctor } from "./commands/doctor.js";
import { runStatus } from "./commands/status.js";
import { runProfiles } from "./commands/profiles.js";
import { runUpdate } from "./commands/update.js";
import { runUninstall } from "./commands/uninstall.js";
import { runLearn } from "./commands/learn.js";
import { ENGINE_VERSION } from "./lib/manifest.js";

const program = new Command();
program
  .name("cdk-kit")
  .description("Install and manage the Cursor Development Kit in any project")
  .version(ENGINE_VERSION);

program.command("init")
  .description("Preview and initialize CDK in the target project")
  .argument("[path]", "project directory", ".")
  .option("-y, --yes", "apply the displayed plan without prompting")
  .option("--dry-run", "show planned changes without writing files")
  .action(runInit);

program.command("doctor")
  .description("Check the current project's CDK installation")
  .argument("[path]", "project directory", ".")
  .action(runDoctor);

program.command("status")
  .description("Show CDK and project profile status")
  .argument("[path]", "project directory", ".")
  .action(runStatus);

program.command("profiles")
  .description("List bundled technology profiles and show evidence-based project matches")
  .argument("[path]", "project directory", ".")
  .action(runProfiles);

program.command("update")
  .description("Safely reconcile CDK-managed files to this CLI version")
  .argument("[path]", "project directory", ".")
  .option("-y, --yes", "apply the displayed plan without prompting")
  .option("--dry-run", "show planned changes without writing files")
  .action(runUpdate);

program.command("learn")
  .description("Show the IDE commands for project learning")
  .action(runLearn);

program.command("uninstall")
  .description("Remove unchanged CDK-managed files from a project")
  .argument("[path]", "project directory", ".")
  .option("-y, --yes", "confirm removal")
  .option("--dry-run", "show what would be inspected without changes")
  .action(runUninstall);

program.showHelpAfterError();
program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`cdk-kit: ${message}`);
  process.exitCode = 1;
});
