# Contributing Guidelines

Thanks for contributing! This repo follows a lightweight trunk-based flow with protected `main` and `develop` branches.

## Branching
- `main`: production-ready; protected, no direct commits
- `develop`: integration branch for sprint work
- `feature/<scope>-<short>`: new features
- `fix/<short>`: bug fixes
- `chore/<short>`: maintenance

## Commit Messages
Follow Conventional Commits:
- feat: add new feature
- fix: bug fix
- docs: documentation changes
- chore: tooling/build/infra
- refactor: code refactor
- test: add or update tests

## Pull Requests
- Create PR from `feature/*` → `develop`
- Template must be filled (What/Why/How/Tests)
- Attach evidence (logs/screenshots/reports) when relevant
- Require review before merge

## Quality Gates
- TS strict mode clean
- Lint passes (ESLint)
- Tests pass locally (unit/integration/E2E as applicable)
- No secrets in the codebase (.env, tokens)

## Releases
- Merge `develop` → `main` via PR and tag a release.
