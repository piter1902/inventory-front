# Lessons log

- L-001 2026-10-18 | INV-001 | specification | Exit animations need an agreed answer for input during the animation (taps, double taps, page underneath) before implementation -> harness grilling checklist `design` (shared/grilling-protocol.md, applied in ~/custom-agents)
- L-002 2026-10-18 | INV-001 | testing | `locator.click()` waits for stability and hides timing bugs; animated UI needs `page.mouse` fast sequences, re-run after each fix round -> `.harness/rules.md` P-007
- L-003 2026-10-18 | INV-001 | automated check | No formatting guardrail; folder-wide Prettier + `git add src` pulled unrelated files into a fix -> P-001 sharpened; CI `prettier --check` task in `.harness/work/inbox.md`
- L-004 2026-10-18 | INV-001 | navigation | Review providers found no CLAUDE.md/AGENTS.md and never read the project rules -> `AGENTS.md` pointer to `.harness/rules.md` + `CLAUDE.md` (`@AGENTS.md`)
- L-005 2026-10-18 | INV-001 | review | Full-range re-reviews kept surfacing new findings each round; re-review the delta (with callers), full range at medium only for shared code, propose closing after two rounds -> harness `review-code` (applied in ~/custom-agents)
- L-006 2026-10-18 | INV-001 | review | Headless `/security-review` returns empty in Claude Code 2.1.302 -> `extra: none` here; harness `review-security` runners.md + defaults (applied in ~/custom-agents)
- L-007 2026-10-18 | INV-001 | conventions | All review fixes of a ticket in one commit, amended per round while unpushed -> `.harness/rules.md` P-008 + harness `implement` `Fix commits` (applied in ~/custom-agents)
- L-008 2026-10-18 | INV-001 | conventions | Commit policy changed mid-ticket (no commits -> per-step commits without AI trailers) -> already covered by P-005 (no new change)
