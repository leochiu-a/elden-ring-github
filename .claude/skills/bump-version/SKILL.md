---
name: bump-version
description: >
  Bump the extension version for elden-ring-github using the changesets flow,
  then sync manifest.json to match. Use when the user wants to bump/release the
  version, run "bump version", cut a release, or apply pending changesets.
  Handles the package.json (changeset-managed) and manifest.json (manually
  synced) version sources, and works around npm/pnpm not being on PATH.
---

# Bump Version

This repo has **two** version sources that must stay in sync:

- `package.json` — managed by [changesets](https://github.com/changesets/changesets). `.changeset/config.json` has `"commit": true`, so `changeset version` auto-creates a `RELEASING: ...` commit.
- `manifest.json` — the shipped Chrome-extension version. **Not** managed by changesets; must be bumped manually.

## Step 1: Assess current state

```bash
grep '"version"' package.json manifest.json
ls .changeset/*.md          # pending changesets (ignore README.md and config.json)
git tag --sort=-v:refname | head -3
```

Read each pending changeset's frontmatter (`major` / `minor` / `patch`) to know the resulting bump — the highest bump type wins. Report the target version and any pre-existing version mismatch between the two files to the user before proceeding.

## Step 2: Run the changeset version bump

Node tooling is often not on PATH in non-interactive shells. Prepend the paths and call the CLI directly:

```bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/Library/pnpm:$PATH"
node node_modules/@changesets/cli/bin.js version
```

This bumps `package.json`, rewrites `CHANGELOG.md`, consumes the changesets, and auto-commits a `RELEASING: ...` commit.

> Note: `git commit --amend` on that auto-generated commit is blocked by the permission classifier. Do **not** try to fold the manifest change into it — use a separate commit (Step 4).

## Step 3: Sync manifest.json

Read the new version from `package.json`, then update `manifest.json`'s `"version"` field to match (Edit tool).

## Step 4: Commit the manifest sync

```bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
git add manifest.json
git commit -m "chore(release): sync manifest version to <NEW_VERSION>

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

## Step 5: Report

Summarize: old → new for both files, which changeset drove the bump, and that nothing is pushed/tagged. Do **not** push, tag, or publish unless the user asks.

## Manual bump (no changesets / override)

If there are no pending changesets, or the user wants a specific bump ignoring changesets, edit **both** `package.json` and `manifest.json` `"version"` fields to the requested version, leave `CHANGELOG.md` untouched, and commit with a `chore(release):` message.
