# Project conventions

## Scope and authority
- Build The Cha Chaan Teng Time Machine from `docs/build-now-spec.md` and `docs/cha-chaan-teng-time-machine.md`.
- Follow the user's supplied global AGENTS.md instructions. Conversation is Chinese; application copy, code, commands and identifiers are English.
- Review the implementation plan with the user before product code. Initial scope is M1; M2 follows M1 sign-off.
- Build-now takes precedence for M1 sequencing and development contracts; the PRD governs cultural rules. Record discrepancies in the plan.

## Structure and naming
- Root: entry HTML, project conventions, README and repository configuration.
- `docs/`: original requirements, implementation plans and verification records. Preserve original requirement text.
- `assets/css/`: styles. `assets/js/`: independent ES modules. Use lowercase kebab-case filenames.
- `content/`: local JSON content; development chapter files end in `.dev.json`.
- `scripts/`: reusable validation and developer utilities.
- `tests/`: Node built-in unit tests (`*.test.mjs`) and Python Playwright browser checks (`test_*.py`).
- `tmp/`: ignored scratch work, screenshots and logs. Scratch scripts have a one-line purpose docstring. Promote reusable fragments to `scripts/`; ask before deleting scratch files.
- Create directories only when they contain work; no empty placeholder trees.

## Implementation
- Plain HTML, CSS and JavaScript ES modules; no framework, build tool or new dependencies without approval.
- Every function/class has documentation and type annotations (JSDoc in JavaScript; Python docstrings/type hints).
- M1 uses local content and a mock guide only. Preserve the visible development badge and production rejection gate.
- Keep functions deterministic where possible; inject clocks/storage into logic for isolated tests.
- Handle only known expected failures at their boundary. Report unexpected errors with context; never conceal errors with broad catch-all fallbacks.
- No historical claims without reviewed sources. No API keys, accounts, third-party analytics or remote assets in M1.
- Do not change storage keys/schema or introduce migrations without explicit user approval.
- No public deployment of M1. Ask before deleting files, adding dependencies, modifying secrets/CI configuration or pushing Git history.
- Keep machine-specific absolute paths out of project documents and code.

## Verification
- Documentation-only setup: verify file existence, original-file SHA-256 preservation and local Markdown links; do not report application tests before code exists.
- Once implementation exists, after each logical code change run `node --test`.
- Content changes also run `node scripts/check-content.mjs --dev` (must pass) and `node scripts/check-content.mjs` (must reject M1 development content).
- UI changes run `uv run python -m unittest discover -s tests/browser -p "test_*.py"` using the user-approved project Playwright dependency and an existing Chromium browser. No additional installation without approval.
- Serve locally with `python -m http.server 8000 --bind 127.0.0.1`.
- Record actual browser/device, viewport, commands and results; distinguish automated checks from unperformed manual NVDA/VoiceOver and physical-device checks.
