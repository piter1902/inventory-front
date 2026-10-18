# Implementation rules (project)

Adapts the harness base rules (SOLID, `implementation-rules.md`, ids `B-*`) to this repository. **This file wins on any conflict.** Keep it short; the repository's own `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md` and linter configs stay authoritative and are not copied here.

- Updated: 2026-10-18

## Commands
- Build: `npm run build` (seen in `package.json`)
- Fast tests (per step): `npx ng test --watch=false` (Vitest via `@angular/build:unit-test`, jsdom)
- Full tests (before finishing): `npx ng test --watch=false` (CI runs `npm test` in `.github/workflows/docker-build.yml`)
- Lint / format / type-check: no linter; `npx prettier --write` on every file the change creates or modifies (P-001); type-check happens in the build
- Single spec: `npx ng test --watch=false --include='<path>.spec.ts'` (P-003)

## Branches and commits
- Base branch: `main`
- Branch name: `feature/<ID>` (e.g. `feature/INV-001`)
- Commit message: `[<ID>] <type>: <imperative summary>` with conventional-commit types (`feat`, `fix`, `test`, `refactor`, `style`, `chore`, `docs`), e.g. `[INV-001] feat: replace box overlay menu with actions dialog`
- Commit trailers: **none** — no `Co-Authored-By` or other AI attribution/session lines (P-005)

## Project conventions
- Angular 21 standalone components with signals, `input()`/`output()`, `inject()` and the new control flow (`@if`, `@for`).
- Features in `src/app/features/<feature>/`, shared UI in `src/app/shared/<name>/`; files named `<name>.ts`/`.html`/`.spec.ts` (no `.component` suffix); class names without the `Component` suffix.
- Styling with Tailwind v4 utilities and the theme tokens in `src/styles.css`; only token colours, so dark mode (`[data-theme='dark']`) works.
- UI copy in Spanish; code, comments and tests in English.
- Unit tests next to the code; `TestBed` with `useValue` mocks and `vi.fn()`; `describe('<Class>')` + `it('should …')`.

## Overrides of base rules

## Project rules
- P-001 Run `npx prettier --write` on every file the change creates or modifies (whole file), even if that reformats lines unrelated to the change; many files on `main` are not Prettier-clean yet | Reason: converge the codebase on the repo's `.prettierrc` | Source: user, implement INV-001 | Date: 2026-10-18
- P-002 Browser checks run with playwright-cli in a headed browser where the user logs in (OIDC on sso.allue.eu) against their local backend; destructive requests (DELETE/POST/PUT) are intercepted with `page.route` and answered locally so no real data changes | Reason: the app is behind login and the backend holds real data | Source: user, implement INV-001 | Date: 2026-10-18
- P-003 To run one spec: `npx ng test --watch=false --include='<path>.spec.ts'`; a folder glob (`dir/**`) also picks up non-spec `.ts` files and reports "No test suite found" | Reason: observed in INV-001 | Source: user, implement INV-001 | Date: 2026-10-18
- P-004 Specs that render a `<dialog>` call `installDialogStub()` from `src/testing/dialog-stub.ts` in `beforeEach` and restore it in `afterEach` (jsdom has no `showModal`/`close`) | Reason: one shared stub (D-020 of INV-001) | Source: user, implement INV-001 | Date: 2026-10-18
- P-005 Commits carry no `Co-Authored-By` or other AI attribution/session trailers; one commit per plan step is expected (B-H1) | Reason: the user does not want the AI as co-author | Source: user, implement INV-001 | Date: 2026-10-18

## Stack checklist
- Angular: no manual subscriptions left open in components that outlive the request; signals updated immutably.
- Tailwind: no hard-coded colours (hex/rgb) in templates; use theme tokens.
- Accessibility: dialogs use native `<dialog>` with `showModal()`, have an accessible name, and return focus on close.
