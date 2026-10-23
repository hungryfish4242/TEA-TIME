# The Cha Chaan Teng Time Machine

An internal, English-language three-chapter prototype for AIH5571. Plain HTML/CSS/JavaScript with an optional standard-library Python DeepSeek proxy; no frontend build or runtime package dependencies.

## Run locally

From the project directory:

```powershell
uv run python server.py --port 8000
```

Open <http://127.0.0.1:8000/>. Complete tea, bun and tart in sequence, collect the three cards, then create your certificate. No development shortcut is needed. The configured local server enables live DeepSeek answers; `?offline=1` selects local sample answers.

| Address | Purpose |
| --- | --- |
| `http://127.0.0.1:8000/` | Normal three-chapter journey and configured live guide |
| `http://127.0.0.1:8000/?offline=1` | Entire journey with local answers |
| `http://127.0.0.1:8000/?dev=1` | Development completion controls and local event export |
| `http://127.0.0.1:8000/?dev=1&mode=kiosk` | Entry attract and certificate idle reset |
| `http://127.0.0.1:8000/?dev=1&mock=fail` | Forced 8-second guide timeout and local fallback |
| `http://127.0.0.1:8000/?reset=1` | Confirmed staff reset with event-export prompt |

Do not open `index.html` through `file://`; ES modules and JSON loading need the local HTTP server. Use `server.py` for the source checkout: it excludes `.local/`, `.git/`, test environments and other private files from HTTP serving. Live questions and current-table conversation are sent to DeepSeek; certificate names are never sent. After initial asset loading, the journey can continue without network access using fallback answers.

## What is implemented

- Entry, how-it-works, order card, three story beats per table, captions and full transcripts.
- Four-pour rhythm practice, one wider retry and a no-timing steady mode.
- Bun assembly with correction, 12-second hint and button-only controls; tart inspection with text descriptions and retry.
- Two-turn per-table live/mock Q&A, local fallback, source panel and order checks.
- Three topic-based card variants per table, card details, sequential unlocks and three-card finale.
- Local 1080 × 1350 PNG certificate with an optional in-memory nickname.
- Progress restore, route guards, visitor/staff resets and kiosk idle behavior.
- Anonymous local events with JSON export and a 2,000-event cap.
- Three generated editorial illustrations, shared by screens and certificate.

Live integration is configured locally. Reviewed cultural fact sheets, final narration/audio and course-team public acceptance are not supplied. Current stories and sources are development material, so the badge and production rejection check remain intentional. A working provider does not make those sources historically verified.

## Verification

The uv development dependency is locked in `uv.lock`. The project uses Playwright with an already installed local Chromium; it does not automatically install a browser.

```powershell
node --test
node scripts/check-content.mjs --dev
node scripts/audit.mjs
uv run python -m unittest discover -s tests/browser -p "test_*.py"
uv run python -m unittest discover -s tests/server -p "test_*.py"
```

The production check must reject this build:

```powershell
node scripts/check-content.mjs
```

Browser tests own their temporary server and do not use paid model calls. Test downloads, screenshots and logs belong in ignored `tmp/`. See [M1 evidence](docs/verification-m1.md), [M2 evidence](docs/verification-m2.md) and [live guide details](docs/live-guide.md). `scripts/evaluate-guide.py` is an explicit 45-call live evaluation and writes credential-free results to `docs/live-evaluation.json`.

## Offline handoff

```powershell
uv run python scripts/package.py
```

This creates `dist/cha-chaan-teng-offline.zip`, containing all three chapters, illustrations and certificate generation. It contains no provider key, local config, Git data or test environment. Unzip and serve that packaged directory with `python -m http.server 8000`; its guide uses local answers. Do not use a generic static server on the source checkout containing local configuration.

## Content and artwork

- [Execution specification](docs/build-now-spec.md)
- [Complete PRD](docs/cha-chaan-teng-time-machine.md)
- [Approved implementation plan](docs/superpowers/plans/2026-10-23-m1.md)
- [Progress and decisions](docs/progress.md)
- [Exact image prompts and attribution](docs/art-direction.md)

Original illustrations are under `assets/img/cards/*.png`; the app loads WebP delivery copies. To re-encode unchanged masters with the existing test tools:

```powershell
uv run python scripts/encode-art.py
```

Replace development content with separately reviewed production files; do not remove development labels to treat this prototype as a release.
