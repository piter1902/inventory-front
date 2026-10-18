# Framework proposals

Applied directly in the harness sources (`~/custom-agents/marketplace/plugins/harness`, synced and validated; not committed there yet) at the user's request.

| Retro | Skill / file | Change | Evidence |
|---|---|---|---|
| INV-001 | `shared/grilling-protocol.md` (design checklist) | add "motion: what input does while elements animate in or out … page underneath stays interactive" | R-1..R-3, R-12, R-13, R-22, R-23; D-017 → D-022 |
| INV-001 | `review-code/SKILL.md` | re-reviews on the delta `PREV_HEAD..HEAD` with callers; full range at `medium` only for shared code/public contracts; propose closing after two fix rounds | three review rounds in INV-001 |
| INV-001 | `implement/SKILL.md`, `references/rules-template.md` | `Fix commits: single` (default, amended per round while unpushed) or `per-finding` | user request, P-008 |
| INV-001 | `review-security/SKILL.md`, `references/runners.md`, `harness-init/SKILL.md`, `README.md` | `extra: none` by default; known issue: headless `/security-review` empty in 2.1.302 | `security/claude-security-review.md` empty twice |
| INV-001 | `design-screens/references/figma.md` | Figma Starter-plan call budget | **rejected** by the user |
