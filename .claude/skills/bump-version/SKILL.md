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

## Step 5: Tag the release

Tag the manifest-sync commit (where both files reach the new version) with a `v`-prefixed tag, matching the existing convention (`v1.5.0`, `v2.0.0`):

```bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
git tag v<NEW_VERSION> <manifest-sync-commit-sha>
```

Push the tag only when pushing (Step 6): `git push origin v<NEW_VERSION>`.

## Step 6: Create the GitHub release

After the tag is pushed, create a GitHub release with `gh`. Use the changeset-authored `CHANGELOG.md` section for this version as the release notes (more meaningful than GitHub's auto-generated PR list). `gh` is at `/opt/homebrew/bin/gh` and is already authenticated.

Extract the section for the new version and create the release:

```bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
VERSION=<NEW_VERSION>
# Pull the CHANGELOG block from "## <VERSION>" up to the next "## " heading.
awk "/^## ${VERSION}\$/{f=1;next} /^## /{f=0} f" CHANGELOG.md > /tmp/release-notes-${VERSION}.md
gh release create "v${VERSION}" --title "v${VERSION}" --notes-file "/tmp/release-notes-${VERSION}.md"
```

If a release for the tag already exists, skip creation (or use `gh release edit v${VERSION} --notes-file ...` to refresh the notes) rather than erroring.

## Step 7: Report

Summarize: old → new for both files, which changeset drove the bump, the tag created, and the release URL. Do **not** push or publish unless the user asks; when the user does ask to push, push the branch, the tag, and create the release.

## Manual bump (no changesets / override)

If there are no pending changesets, or the user wants a specific bump ignoring changesets, edit **both** `package.json` and `manifest.json` `"version"` fields to the requested version, leave `CHANGELOG.md` untouched, and commit with a `chore(release):` message.
