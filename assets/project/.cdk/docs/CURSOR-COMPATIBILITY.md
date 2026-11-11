# Cursor Compatibility Notes

This kit uses Cursor's project-level customization conventions:

- Project Rules: `.cursor/rules/*.mdc`
- Custom Commands: `.cursor/commands/*.md`
- Agent Skills: `.cursor/skills/<skill-name>/SKILL.md`

Cursor also supports `AGENTS.md` as a plain Markdown instruction file. This kit does not install a root `AGENTS.md` by default because it would duplicate the core rule. Add one only if you need a portable instruction file for multiple coding agents.

Official documentation:
- Rules: https://cursor.com/docs/context/rules
- Commands: https://cursor.com/docs/agent/chat/commands
- Skills: https://cursor.com/docs/skills
- Customize: https://cursor.com/docs/customize-cursor

Learning commands `00-cdk-init` and `31-learn` through `40-learning-report` live beside the engineering commands. Rules `08-learning-boundaries` and `09-proactive-learning` tell the agent when to consult `.cdk/` and when to record a proposed lesson. The terminal commands `cdk-kit knowledge`, `cdk-kit promote`, and `cdk-kit sync` operate on local files only.

Feature names, discovery paths and frontmatter support may evolve. Check the official docs when upgrading Cursor or changing the kit. Do not assume that a command or skill was discovered merely because its file exists; confirm it appears in Cursor's Agent UI.
