# Working Memory Protocol Implementation

**Status**: ✅ Implemented across all repositories
**Date**: 2025-11-01

## Overview

The Working Memory Protocol and Notion Resources references have been integrated into all key documentation files to ensure ALL AI agents follow the mandatory workflow.

## Files Updated

### Frontend Repository (`customvenom-frontend`)

1. **`.cursorrules`** — Added:
   - Working Memory Protocol (MANDATORY) section with 6-step workflow
   - Notion Resources (MANDATORY REFERENCE) section
   - Direct links to protocol docs and Notion source

2. **`CURSOR_GUARDRAILS.md`** — Added:
   - 🧠 **MANDATORY: Working Memory Protocol** section (lines 113-133)
   - 📋 **Project Roadmap & Resources** section (lines 134-145)
   - User commands: `show context`, `context check`, `show context first`, `reset context`
   - Links to `docs/CURSOR_WORKING_MEMORY_PROTOCOL.md` and Notion source

### Workers API Repository (`customvenom-workers-api`)

1. **`.cursorrules`** — Added:
   - Working Memory Protocol (MANDATORY) section with 6-step workflow
   - Notion Resources (MANDATORY REFERENCE) section
   - Direct links to protocol docs and Notion source

2. **`INSTRUCTIONS.md`** — Added:
   - 🧠 **MANDATORY: Working Memory Protocol** section (lines 243-262)
   - 📋 **Project Roadmap & Resources** section (lines 264-274)
   - User commands and protocol references

## Protocol Requirements (Now Enforced)

### Before ANY Code Changes:

1. **Anchor**: State the task and acceptance criteria
2. **Load**: Read all files that will be modified
3. **Baseline**: Quote relevant existing code sections
4. **Plan**: Show what will change (before → after)
5. **Execute**: Make changes only after approval
6. **Hand-back**: Report what changed and acceptance status

### User Commands Available:

- `show context` — Display current task, loaded files, and plan
- `context check` — Verify proper context before proceeding
- `show context first` — Stop and load context if not already done
- `reset context` — Clear working memory (end of task)

## Notion Resources (Mandatory Reference)

All agents MUST reference `docs/NOTION_RESOURCES.md` for:
- **MVP & Roadmap**: CustomVenom MVP - Next - Later Synopsis
- **Sprint Planning**: Roadmap Alignment - Next 3 Sprint
- **Build Manual**: CustomVenom Build Manual v1
- **UI Design**: Custom Venom UI Design Brief v1
- **Development Resources**: Frontend Agent Resource Pack, Debugger Handoff

## Verification

✅ Protocol documents exist:
- `docs/CURSOR_WORKING_MEMORY_PROTOCOL.md` (both repos)
- `docs/NOTION_RESOURCES.md` (both repos)

✅ References added to:
- `.cursorrules` (both repos)
- `CURSOR_GUARDRAILS.md` (frontend)
- `INSTRUCTIONS.md` (workers-api)

✅ Committed and pushed:
- Frontend: commit `6b7b406`
- Workers API: commit `acdba83`

## Next Steps for Agents

When starting any task:
1. Read `docs/CURSOR_WORKING_MEMORY_PROTOCOL.md` for complete protocol
2. Read `docs/NOTION_RESOURCES.md` for roadmap alignment
3. Follow the 6-step workflow before making changes
4. Reference Notion pages for scope and priorities

## Related Documentation

- **Protocol Source**: [Cursor Working Memory Protocol Handoff](https://www.notion.so/Cursor-Working-Memory-Protocol-Handoff-62ba04448a0141a7b158bdacb18d662a)
- **Project Home**: [Custom Venom Home](https://www.notion.so/Custom-Venom-Home-2879f930952d816dbb53e0e810d1f8f8?pvs=21)
- **Agent Instructions**: [My Custom Venom AI Agent](https://www.notion.so/My-Custom-Venom-AI-Agent-2859f930952d8047bfeccbe61199d600?pvs=21)

