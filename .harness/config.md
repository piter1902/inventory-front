# Harness config

## Design

provider: wireframes       # figma | wireframes
figma-file: https://www.figma.com/design/yiLKmaoTXEq3cquQ7ReuNk/Inventory  # Figma file URL; design-screens asks for it when empty
figma-library:        # published design-system library, optional
design-system-page: 0 · Design system   # Figma page with the shared foundations and components

## Tickets

provider: notion      # notion | obsidian | plain-text
source:               # default database / view / folder to import from
id-prefix: INV # prefix for ticket IDs, e.g. INV

## Implementation

workspace: branch   # worktree | branch | in-place
pause: end            # end | each-step | none

## Code review

providers: claude-code-review    # claude-code-review | harness (comma-separated)
base: main                       # branch the diff is taken against
claude-code-review-level: high   # low | medium | high | xhigh | max

## Security review

base: main                       # branch the diff is taken against
runner: claude-cli               # claude-cli | codex-cli | subagent
verifier-runner: same            # same | claude-cli | codex-cli | subagent
extra: none                      # claude-security-review | none (headless /security-review returns empty in Claude Code 2.1.302)
lenses: all                      # all | comma-separated list of lenses
