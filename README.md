# The Cha Chaan Teng Time Machine

An internal, English-language M1 prototype for the AIH5571 course project. Plain HTML, CSS and JavaScript modules; no frontend build or runtime package dependencies.

## Run locally

From the project directory:

```powershell
uv run python -m http.server 8000 --bind 127.0.0.1
```

Open <http://127.0.0.1:8000/?dev=1>. Complete the tea table, collect the card, then use **Complete remaining chapters** to preview the three-card scene and certificate. Bun and tart interactions belong to M2 and remain locked in this build.

| Address | Purpose |
| --- | --- |
| `http://127.0.0.1:8000/` | Normal phone journey with the tea chapter |
| `http://127.0.0.1:8000/?dev=1` | Development completion controls and local event export |
| `http://127.0.0.1:8000/?dev=1&mode=kiosk` | Entry attract and certificate idle reset |
| `http://127.0.0.1:8000/?dev=1&mock=fail` | Forced 8-second guide timeout and local fallback |
| `http://127.0.0.1:8000/?reset=1` | Confirmed staff reset with event-export prompt |

Do not open `index.html` through `file://`; ES modules and JSON loading need the local HTTP server. No external service is contacted by the application. Once the initial local assets have loaded, the journey continues without network access.

## What is implemented

- Entry, how-it-works, order card, three tea story beats, captions and full transcripts.
- Four-pour rhythm practice, one wider retry and a no-timing steady mode.
- Two-turn mock Q&A, local fallback, source panel and order check.
- Topic-based tea card labels, card detail, three-card development finale.
- Local 1080 × 1350 PNG certificate with an optional in-memory nickname.
- Progress restore, route guards, visitor/staff resets and kiosk idle behavior.
- Anonymous local events with JSON export and a 2,000-event cap.
- Three generated editorial illustrations, shared by screens and certificate.

No live model, narration, approved historical story, production deployment or final M1 course-team sign-off is included. The development badge and production rejection check are intentional.

## Verification

The uv development dependency is locked in `uv.lock`. The project uses Playwright with an already installed local Chromium; it does not automatically install a browser.

```powershell
node --test
node scripts/check-content.mjs --dev
node scripts/audit.mjs
uv run python -m unittest discover -s tests/browser -p "test_*.py"
```

The production check must reject this build:

```powershell
node scripts/check-content.mjs
```

Browser tests own their temporary local server and close it afterwards. Test downloads, screenshots and logs belong in ignored `tmp/`. See [verification evidence](docs/verification-m1.md) for actual results and remaining device checks.

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
