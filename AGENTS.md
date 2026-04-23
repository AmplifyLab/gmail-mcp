# AGENTS.md

## Project Overview

This repository contains a Docker-first MCP server for Gmail.

- Runtime: Node.js (inside Docker image)
- Language: TypeScript
- Protocol: Model Context Protocol (MCP) over process I/O
- Main entrypoint: `src/server.ts`
- Transport target: Claude/Desktop-style MCP clients via Docker `run --rm -i ...`
- API target: Gmail API v1 (`https://gmail.googleapis.com/gmail/v1`)
- Required env: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`

## Architecture Notes

- Tool registration is centralized in `src/server.ts`.
- Each tool lives in its own file under `src/tools/`.
- HTTP calls are implemented in `src/gmail-request.ts`.
- MCP response wrapping is in `src/mcp-response.ts`.
- Docker publishing is handled by `.github/workflows/docker-publish.yml` (build -> artifact -> deploy to GHCR).

## Workflow Rules For Agents

1. Keep the project Docker-first.
2. Prefer minimal, explicit docs focused on end-user setup.
3. Maintain strict TypeScript (no `any` unless explicitly approved).
4. Validate changes with:
   - `npm run build`
   - optional stricter check: `npx tsc -p tsconfig.json --noEmit --noUnusedLocals --noUnusedParameters`

## Commit + Tag Policy (Mandatory)

When an agent creates a commit, it must also create a matching semantic version tag.

Commit messages must use Conventional Commits format only.

- Required format: `<type>(<optional-scope>): <description>`
- Allowed types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `build`, `ci`, `perf`, `revert`
- Examples:
  - `feat(tools): add company update tool`
  - `fix(readme): correct Claude Docker config`
  - `chore(ci): update docker publish workflow`

- Tag format: `vMAJOR.MINOR.PATCH` (example: `v0.2.3`)
- Tag must reference the same commit the agent just created.
- Use annotated tags.

### Versioning guidance

- PATCH: bug fixes, docs-only, refactors without new features
- MINOR: new backward-compatible features/tools
- MAJOR: breaking changes

### Required sequence after commit

```bash
git commit -m "your message"
git tag -a vX.Y.Z -m "vX.Y.Z"
```

### Push sequence

```bash
git push origin master
git push origin vX.Y.Z
```

If a commit is created without a tag, treat it as incomplete and add the correct tag immediately.
