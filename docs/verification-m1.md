# M1 verification — 23 October 2026

## Scope

Local Windows implementation on `feat/m1`, with English UI and development content. The user approved continuous test/commit execution and later approved generated food artwork and a project uv/Playwright environment.

## Evidence

- Task 1: 7 Node tests passed; state, persistence, guarded routes and reset scopes.
- Task 2: 10 Node tests and 2 Chromium tests passed; entry, reading checkpoints, dialogs and narrow viewport.
- Task 3: 14 Node tests and 3 Chromium tests passed; rhythm boundaries, retry, duplicate taps, steady mode and resume.
- Task 4: 18 Node tests and 5 Chromium tests passed; two-turn guide cap, 8-second fallback, correction-before-card and unique variant restoration.
- Task 5: 20 Node tests and 6 Chromium tests passed; actual named/unnamed PNG download at 1080 × 1350, name absent from storage and cleared by reload. Generated-art integration repeated the suite; certificate received an additional targeted check.
- Task 6 and review fixes: `node --test` passed 26/26; `uv run python -m unittest discover -s tests/browser -p "test_*.py"` passed 15/15 in 155.062 seconds. Logs: `tmp/unit-final-green.log`, `tmp/browser-final-green.log`.
- Browser: existing Chromium 147.0.7727.15 on Windows. Local app-ready measurement: 193.90 ms on this machine; this is not a claim about the final booth device.
- Browser coverage includes a keyboard-only journey, ten complete offline visits, 375 × 667 / 1024 × 768 / 1440 × 1000 screenshots, storage denial/corruption, reset after an outstanding guide request, repeated kiosk countdown cancellation, source dialogs, guide limits, named/unnamed PNG download and reload checkpoints.
- Independent review and RED→GREEN fixes are recorded in [review-m1.md](review-m1.md). No deferred reviewer findings remain.
- `node scripts/check-content.mjs --dev`: passes.
- `node scripts/check-content.mjs`: intentionally exits nonzero with `development content cannot ship`.
- Original PNG masters retained. Three WebP delivery images total 694,902 bytes.
- `node scripts/audit.mjs`: application files including PNG masters total 8,388,362 bytes; initial delivery budget estimate is 724,778 gzipped bytes. Main text color pairs range from 5.31:1 to 11.41:1 contrast. This palette check is not a complete accessibility certification.
- Inspected generated images and downloaded certificate visually. Desktop/phone screenshots are in `tmp/`.
- Local preview verified with HTTP 200 at `http://127.0.0.1:8000/?dev=1` and left running for user review.

## Remaining manual acceptance

Physical iPad/iPhone Safari, Android Chrome, NVDA, VoiceOver and actual 200% browser/text zoom have not been tested here. Automated Chromium checks do not establish those results. Course-team cultural/content review and final M1 sign-off remain external acceptance work. M2 starts after that sign-off.

## Environment cleanup

The user authorized deleting a broken old virtual environment from another project. The first composite removal command was policy-rejected. A narrower literal-path command succeeded after path/reparse-point checks and preservation of the environment config/package inventory in `tmp/`. No source files from that project were changed. Current browser tests use this project's uv environment.
