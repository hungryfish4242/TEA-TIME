# M2 and live integration — 23 October 2026

## Completed behavior

All three tables now use the shared chapter flow. Tea collection unlocks bun; bun collection unlocks tart. Each table has three story beats, its own guide topics and card variants, a practice, two-turn Q&A and a required order check. Bun offers split/butter/close with ingredient correction and a 12-second hint. Tart offers optional inspection, descriptions and selection correction. Only the quiz unlocks a card. Normal visitors reach the finale and PNG certificate without developer completion controls.

Progress uses the same version and storage keys. Incomplete bun/tart practice restarts at its activity checkpoint after reload; completed activities persist. Legacy M1 dev-filled cards stay identified by their minimal data rather than being rewritten as completed real activities.

## Evidence

- Shared engine tests: 31 Node tests passed after chapter generalization.
- Interaction tests: 33 Node tests passed.
- Three targeted Chromium checks passed, including normal three-table completion, keyboard choices with distractor recovery, and certificate download.
- Live-mode browser boundary test passed: actual frontend HTTP request contract, accurate disclosure and validated response rendering, without a paid provider call.
- Two backend checks passed: input/response validation, known source restrictions, and HTTP denial of config/Git/source-code paths.
- Real DeepSeek smoke call succeeded in 1,063 ms.
- Live evaluation: 45/45 tests passed across the three development corpora. Scope is structural validity, permitted citations and refusal of unsupported/injection requests, NOT cultural fact accuracy. Details in `live-evaluation.json`.
- Offline package created from an explicit application-file allowlist; config, Git and environments excluded; ZIP integrity checked.
- Complete browser regression and independent final review are recorded at final handoff below.
- Final gate: 37/37 Node tests, 2/2 backend tests, and 20/20 Chromium tests passed. Full browser suite took 187.192 seconds. Logs: `tmp/m2-final-unit.log`, `tmp/m2-final-browser.log`. A subsequent annotation-only fixture check also passed.
- Independent review fixes are documented in [review-m2.md](review-m2.md). Targeted regressions for private test-server paths, accepted UI citations and late share completion passed.
- Real browser → local proxy → DeepSeek → rendered answer passed after the citation fix: 1,483 ms, `fallback=false`. The same real-server run completed the three chapters at 1024 px and captured bun/tart screens.
- Latest audit: 8,417,221 bytes of application assets including original PNG masters; 733,176 gzipped delivery bytes. Offline ZIP: 28 files, 736,183 bytes, integrity checked.

## Remaining external inputs

Reviewed historical fact sheets/corpus, approved narration scripts and audio, independent artwork/cultural review, physical booth hardware and actual Safari/Android/NVDA/VoiceOver acceptance are still absent. They cannot be truthfully replaced by a mock result or this developer-machine test. No public deployment is performed.
