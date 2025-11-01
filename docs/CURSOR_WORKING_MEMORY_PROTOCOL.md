# Cursor Working Memory Protocol — Handoff

🎯 **Purpose**

This protocol ensures that Cursor (and AI coding assistants) always maintain explicit context about what they're working on and reference actual current code state before making changes.

**Problem it solves:**

- AI creates code without looking at existing files first
- AI changes files without understanding current patterns
- AI makes assumptions about code structure that are wrong
- AI creates handoffs that don't match actual implementation

---

## Core Protocol — MANDATORY

### Before ANY code changes, you MUST:

1. **Anchor**: Identify the current task and acceptance criteria
2. **Load**: Read all files that will be modified
3. **Baseline**: Quote relevant existing code sections
4. **Plan**: Show what will change (before → after)
5. **Execute**: Make changes only after approval
6. **Hand-back**: Report what changed and acceptance status

---

## Standard Format for Every Coding Session

### 1) Initial Context Load

```markdown
🎯 Current Task: [Task name or user request]

Acceptance Criteria:

- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

📁 Files to Modify:

- src/app/dashboard/page.tsx
- src/components/Button.tsx
- src/lib/utils.ts

📝 Current State (relevant excerpts):

**src/app/dashboard/page.tsx** (lines 10-25)
```

export default function DashboardPage() {
return <div>Current implementation</div>
}

```

**src/components/Button.tsx** (lines 5-15)
```

export function Button({ children }: { children: React.ReactNode }) {
return <button>{children}</button>
}

```

🔧 Proposed Changes:

1. **src/app/dashboard/page.tsx**
   - Add team selector dropdown
   - Wire to API endpoint /api/teams
   - Handle loading and error states

2. **src/components/Button.tsx**
   - Add variant prop (primary, secondary)
   - Add loading state

✅ Ready to proceed? Reply "yes" to continue.
```

### 2) After Making Changes

```markdown
✅ Changes Complete

📝 Files Modified:

- src/app/dashboard/page.tsx: Added team selector with loading/error states
- src/components/Button.tsx: Added variant and loading props
- src/lib/utils.ts: Added fetchTeams helper function

📋 Acceptance Status:

- [x] Team selector displays on dashboard
- [x] Loading state shows spinner
- [ ] Error handling needs testing

🔗 Related:

- API endpoint: /api/teams
- Component docs: See Button.tsx JSDoc comments

⏭️ Next Steps:

- Test error scenarios
- Add unit tests for fetchTeams
- Update Storybook examples
```

---

## Enforcement Rules

### ❌ DO NOT:

- Start coding without loading the actual files first
- Make assumptions about code structure
- Modify multiple unrelated files without approval
- Change file locations or names without explicit request
- Add features not in the current task scope

### ✅ DO:

- Always read files before modifying them
- Quote existing code when discussing changes
- Show before/after diffs for complex changes
- Ask for clarification when scope is ambiguous
- Work methodically through one file at a time

---

## Quick Commands

**For the user to say:**

- `show context` — Display current task, loaded files, and plan
- `context check` — Verify you have proper context before proceeding
- `show context first` — Stop and load context if you haven't already
- `reset context` — Clear working memory (end of task)

**For Cursor to use:**

- Read all files in scope before proposing changes
- Use `git diff` to show exactly what changed
- Run tests/linters before marking complete

---

## Example Session

### Bad (without protocol):

```
User: "Add a login button to the dashboard"

Cursor: "I'll add a login button for you:"

[Creates new LoginButton component, modifies dashboard,
adds routing, changes navbar, all without checking what exists]
```

**Problems:**

- Didn't check if LoginButton already exists
- Didn't see that dashboard has a specific layout pattern
- Didn't know navbar uses a specific component library
- Created conflicts with existing code

### Good (with protocol):

```
User: "Add a login button to the dashboard"

Cursor:

🎯 Current Task: Add login button to dashboard
Acceptance: Button visible on dashboard, triggers auth flow

📁 Files to Check:
- src/app/dashboard/page.tsx
- src/components/ (checking for existing button components)
- src/lib/auth.ts (checking auth patterns)

Let me read these files first...

[Reads files]

📝 Current State:
- Dashboard uses <DashboardLayout> wrapper
- Existing <Button> component in src/components/ui/Button.tsx
- Auth flow uses useAuth() hook from src/lib/auth.ts

🔧 Proposed Changes:
1. Import Button and useAuth into dashboard/page.tsx
2. Add login button in the header section (line 23)
3. Wire onClick to handleLogin from useAuth

This follows the existing patterns. Proceed?
```

---

## Integration with Cursor Rules

Add this to your `.cursorrules` file:

```markdown
# Working Memory Protocol

Before modifying any code:

1. State the task and acceptance criteria
2. Read all files that will be modified
3. Show relevant existing code
4. Propose specific changes with before/after
5. Wait for approval before executing
6. Report what changed and acceptance status

Never:

- Code without reading files first
- Make assumptions about existing code
- Modify multiple unrelated files without approval
- Change button text or UI copy without explicit approval

Always:

- Quote existing code when discussing changes
- Follow existing patterns in the codebase
- Ask for clarification when scope is ambiguous
```

---

## Acceptance Criteria for This Handoff

- [ ] Cursor reads files before proposing changes
- [ ] Cursor shows current state before modifications
- [ ] Cursor proposes changes with before/after diffs
- [ ] Cursor waits for approval before executing
- [ ] Cursor reports acceptance status after changes
- [ ] No assumptions about code that wasn't read
- [ ] Single-file focus unless multi-file explicitly requested

---

💡 **Tips for Success**

1. **Be explicit**: If Cursor starts coding without context, say "show context first"
2. **One thing at a time**: Complete one file/feature before moving to the next
3. **Review diffs**: Always check `git diff` before committing
4. **Test as you go**: Run tests after each change, not at the end
5. **Keep scope tight**: Resist feature creep within a single task

---

## Related

- Notion Source: [Cursor Working Memory Protocol Handoff](https://www.notion.so/Cursor-Working-Memory-Protocol-Handoff-62ba04448a0141a7b158bdacb18d662a)
- Parent instructions: [My Custom Venom AI Agent](https://www.notion.so/My-Custom-Venom-AI-Agent-2859f930952d8047bfeccbe61199d600?pvs=21)
- Project home: [Custom Venom Home](https://www.notion.so/Custom-Venom-Home-2879f930952d816dbb53e0e810d1f8f8?pvs=21)
