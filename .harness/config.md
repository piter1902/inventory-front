# Harness config

## Design

provider: figma       # figma | wireframes
figma-file: https://www.figma.com/design/yiLKmaoTXEq3cquQ7ReuNk/Inventory  # Figma file URL; design-screens asks for it when empty

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
extra: claude-security-review    # claude-security-review | none
lenses: all                      # all | comma-separated list of lenses
