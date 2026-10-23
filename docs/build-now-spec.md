# Build-Now Spec — The Cha Chaan Teng Time Machine

**Status:** Execution copy for M1 and M2  
**Date:** 23 October 2026  
**Full product PRD:** [cha-chaan-teng-time-machine.md](./cha-chaan-teng-time-machine.md)  
**Audience:** Members A and B (build), Members C, D and E (content slots), Member F (visual placeholders)

> This is a re-baselined build week. It does not claim that the original Week 8 gate was met. It defines what the team can build now, without verified fact sheets, a live AI provider, final artwork, recorded audio or the booth hardware.

---

## 0. How to use this document

- Build **M1** in the order below. Do not start with final art, audio or the live API.
- Every requirement in Sections 3–9 is buildable with placeholder content and no network.
- Anything that needs a verified fact, an API key, a final asset or the booth device is in Section 11, not in M1.
- The full PRD remains the source for cultural rules, final acceptance criteria and complete product scope. If this document and the PRD differ on sequencing, this document wins for M1/M2. If they differ on a cultural rule, the PRD wins.
- M1 is an **internal build**. It must never be presented as the public experience.

---

## 1. The build rule

**Build the container now; swap the content later.**

The product's mechanics, states and accessibility do not depend on the final facts. The facts, art, audio and live model do. Separate them cleanly:

| Layer | Build now | Swap later |
| --- | --- | --- |
| App shell, routing, state, reset | Yes | Nothing |
| Chapter template, story beats, progress | Yes | Final copy, captions, audio |
| Interaction framework and tea interaction | Yes; bun and tart in M2 | Final instructional copy, final art |
| Q&A UI and fallback behaviour | Yes, with a mock adapter | Live endpoint, real corpus, curated bank |
| Cards and certificate layout | Yes, with CSS placeholders | Three master illustrations, reviewed crops |
| Sources and privacy | Shell and accurate dev copy | Verified sources, licences, final credits |
| Telemetry | Yes, local only | Nothing |
| Audio/TTS | No | Scripts, voice, files |
| Web Share, staff panel | No | Later milestones |

**Hard rule:** no placeholder may reach a public build. A visible development badge, a machine check and a production flag enforce this. See Section 7.

---

## 2. What can start now

| Area | Can start now? | Missing input | M1 approach |
| --- | --- | --- | --- |
| App shell, hash routing, state machine | Yes | None | Build the full three-chapter shell |
| Entry, how-it-works, order card | Yes | None | Final UI copy can be drafted now |
| Tea chapter | Yes | Final story/quiz copy | Build the complete chapter with development copy |
| Pineapple bun chapter | Mechanics yes, content no | Final copy | M2; shell slot is built in M1 |
| Egg tart chapter | Mechanics yes, content no | Final copy | M2; shell slot is built in M1 |
| Q&A UI | Yes | Live endpoint and corpus | Mock adapter plus development bank |
| Card reveal and card detail | Yes | Final illustrations | CSS placeholder at the final aspect ratio |
| Finale and certificate | Yes | Final art | Typographic composition and PNG generation |
| Audio and TTS | No | Approved scripts and voice files | Text-only; audio control disabled with an honest label |
| Sources and privacy modals | Shell yes | Verified bibliography | Development entries clearly labelled |
| Staff panel | No | S13 scope | `?reset=1` confirmation and kiosk idle reset only |
| Web Share | No | Device support and final image | Download only |
| Local telemetry | Yes | None | Event buffer and JSON export |
| Booth device and network | No | Carnival setup | Responsive build; test on the closest tablet |

---

## 3. Locked decisions for M1/M2

These close the decisions that would otherwise block the first commit. Changing one requires agreement from both web owners and must preserve a static export.

1. **Static folder, no framework.** Plain HTML, CSS and ES modules. No React, Vue, state library or CSS framework. The distribution is a static folder that can be served locally and, if the course requires it, inlined into one file later.
2. **Development server.** Use any local static server (VS Code Live Server, `python -m http.server`, or `npx serve`). `file://` is not a supported development target. The final single-file build is a separate packaging step.
3. **Hash routes** from the PRD: `#/`, `#/order`, `#/tea`, `#/bun`, `#/tart`, `#/scene`, `#/certificate`. Sub-steps inside a chapter are internal state, not separate routes.
4. **Modes.** `?mode=kiosk` enables attract, idle reset and booth defaults. No query parameter means phone mode.
5. **No network in M1.** All content is local. The Q&A adapter is mocked. No provider key exists anywhere in the repository.
6. **Text-first.** Captions and transcripts render even though no audio files exist. The audio control is disabled with the label “Narration not in this build.”
7. **One certificate layout.** 1080 × 1350 PNG, generated locally, download only. No share sheet in M1.
8. **One card design per chapter.** Variant switching is implemented, but all variants use the same placeholder artwork and different labels.
9. **Simple reset only.** `?reset=1` opens a confirmation. The full staff panel (S13) is deferred. Kiosk idle rules still apply.
10. **Accessibility is P0 from the first commit.** It is not a later pass.
11. **No runtime image generation, no fourth chapter, no accounts, no cookies, no third-party analytics.**
12. **No factual copy written from memory.** Development copy contains no historical claims. See Section 6.

**Browser targets for M1:** Chrome and Edge on Windows, Safari on iPad (10.2" or later) and iPhone 12/13/14 or equivalent, Chrome on Android. Test at 375 × 667 and 1024 × 768.

---

## 4. M1 — Tea vertical slice

### 4.1 User path

Normal M1 path:

`E1 entry → E2 how it works → O1 order card → C1 tea intro → C2 three story beats → C3 tea interaction → C4 Q&A → C5 order check → C6 card reveal → C7 card detail → O1 updated`

To test the finale before Chapters 2 and 3 exist, a development-only control on O1 fills the bun and tart slots with placeholder cards:

`O1 (dev complete all) → F1 finale → F2 certificate → download → new visit`

The dev control is visible only when the app is loaded with `?dev=1`. It is not a visitor feature and must fail the production content check.

### 4.2 Screen requirements

| Screen | M1 requirement | Acceptance |
| --- | --- | --- |
| **E1 — Entry / attract** | Title, three-food promise, 15–20 minute label, Start, How it works, AI disclosure with the M1 mock label, “Text-only build” badge. Kiosk mode shows an attract loop after 45 seconds of inactivity. | Start is keyboard-operable; no audio autoplay; AI disclosure visible without opening a modal; touching the attract screen returns to entry without losing a session. |
| **E2 — How it works** | Three steps (get an order card, meet three guides, collect cards and a certificate), duration, accessibility note, AI disclosure, close. | Modal traps focus, closes on Escape, restores focus to the trigger. |
| **O1 — Order card** | Three chapter panels with food name, guide role and status. Tea is available; bun and tart are locked with text, not colour alone. Progress indicator, collected-card strip, resume action. Development-only “Complete all chapters” control with `?dev=1`. | Locked panels do not navigate and explain why. Reload restores the correct status. Tea completion updates the card strip. No horizontal scroll at 375 px. |
| **C1 — Chapter intro** | Guide role, guide name, “AI guide” label using the M1 mock wording, fictional-composite note, chapter title, one idea, Start. | The AI label and the fictional-composite note are visible without opening Sources. Keyboard focus moves to the chapter heading. |
| **C2 — Story** | Three beats; progress “Beat 1 of 3”; story text; caption area; transcript toggle; Back and Next; no auto-advance. Development copy of 70–110 words per beat. No audio element. | Reload resumes at the last completed beat. Transcript is reachable and readable by screen reader. Focus moves to the new beat heading. Next is disabled while a beat is loading or missing. |
| **C3 — Tea interaction** | Pot, cup, stained mesh bag and stream as CSS/SVG placeholders. Marker moves across a target band. Large Pour button; Space/Enter also works. Four pours at 72 BPM. Perfect ±120 ms, good ±250 ms. At least three good pours completes. One retry with a wider window. Steady mode removes the marker. Reduced motion removes the arc and uses a static fill. No fail screen. | Three good pours completes. Fewer than three good pours offers one retry. After the retry the activity completes regardless. Steady mode completes after four taps with no score. Rapid double taps count once per beat. Leaving mid-activity resumes at the last completed beat. No score is shown. |
| **C4 — Ask the guide** | Three large question chips; “Type my own question” with a 120-character limit; two turns maximum; Skip for now; loading state; answer panel; source line; fallback panel; offline note; plain-text rendering. Both chips and free text call the guide adapter. | A chip and a free-text question both return a mock answer. A second follow-up is allowed. A third is closed with the cap copy. Skip selects the default card variant. Timeout or mock failure shows a development fallback within 8.5 seconds; there is no dead end. HTML in a mock answer is rendered as text, never as markup. The source line opens S1. The development privacy note is accurate: nothing is sent anywhere in M1. |
| **C5 — Order check** | One question, three options, one correct answer. Wrong answer shows a clue and allows another attempt. Second wrong answer reveals the correct option and requires the visitor to tap it or tap “Place my order.” Correct answer places the order. Log `firstTryCorrect`. Development question tests the interaction, not cultural knowledge. | A correct first attempt places the order and logs `firstTryCorrect: true`. Two wrong attempts reveal the answer; the visitor must still take the correct action. No card unlocks before the order is placed. No dead end. Keyboard operable. Correctness is not shown by colour alone. |
| **C6 — Card reveal** | Stamp animation on the order card; one tea card; variant chosen by Q&A topic or default on skip; CTA to card detail and back to O1. | The card unlocks exactly once, including after reload. The variant matches the topic mapping. Skip uses the default. The stamp becomes static under reduced motion. |
| **C7 — Card detail** | Modal with a larger card, title, caption, one fact slot and a source note. | Focus trap and Escape work. The source note opens S1. The development fact slot says “Development placeholder — no cultural claim.” |
| **F1 — Finale** | Three card slots composed into a cha chaan teng scene using CSS/SVG and the three card placeholders. Tea card from the journey; bun and tart placeholders only in dev-complete mode. No fourth illustration. CTA to certificate. | All three slots have locked and filled states. The composition works at 375 px and 1024 px. Reduced motion removes any assembly animation. No runtime image generation. |
| **F2 — Certificate studio** | Optional nickname, 24 characters; live preview; 1080 × 1350 PNG generation; download; new visit. Kiosk mode: after 60 seconds idle, a 10-second countdown with “Keep looking” and “Start a new visit.” Fine print. | Empty name produces a valid certificate. Long names truncate in the preview only. PNG downloads at 1080 × 1350. A second tap does not generate twice. Reload clears the name. The countdown can be cancelled. Fine print states that this is a student-project prototype, not an official heritage qualification, and that content is AI-assisted and pending review in M1. No share sheet in M1. |
| **S1 — Sources and credits** | Modal or tab with source list, image/audio/font credits, licences, AI disclosure. Development entries are labelled as such. | Opens from E1, the Q&A source line, C7 and the certificate. Focus trap and Escape work. No raw external URL is required. |
| **S2 — Privacy and AI disclosure** | What is stored locally, what is sent (nothing in M1), what the final live build will send, retention and clearing. Fictional-guide notice. | Copy distinguishes the M1 mock from the final live behaviour. “Clear my data” runs the same reset as a new visit. |
| **X1 — Offline / degraded banner** | Non-blocking banner component: “The core journey still works. The live guide is offline.” In M1, triggered by a dev toggle because there is no live guide. | Banner is dismissible, does not cover the primary action, and is announced to assistive technology. |
| **ST — Simple staff reset** | `?reset=1` confirmation; clears progress, transcript, settings and events after an export prompt. Kiosk idle reset. No full staff panel. | Confirm and cancel both work. After reset, no previous name, cards or questions remain. The next visitor starts at E1. |

### 4.3 Interaction state

The tea activity stores:

```json
{
  "status": "not_started | in_progress | complete",
  "attempts": 0,
  "goodPours": 0,
  "usedSteadyMode": false,
  "lastCompletedPour": 0
}
```

Rules:

- One completion per chapter. Re-entering a completed activity shows the completed state and a “Continue” action, not a replay that can issue a second card.
- A retry is one additional round, not an unlimited loop. After the retry, the activity completes regardless of the result, with supportive copy.
- The score is never shown to the visitor. `goodPours` is for internal state and telemetry only.
- Timing uses elapsed time, not frame count, so a slow device does not change the window.

### 4.4 State and persistence

Use the session schema in Section 5.1. Derive the current chapter sub-step from stored fields rather than adding a second source of truth:

1. `storyBeat < 3` → story.
2. `interaction.status !== "complete"` → interaction.
3. `qa.status` is `not_started` or `in_progress` → Q&A.
4. `quiz.status !== "complete"` → order check.
5. Otherwise → card reveal.

Save after every transition, interaction attempt, Q&A turn, quiz attempt and card unlock. On load, restore the session and route to the derived step. If the session is missing or invalid, start at E1.

Reset rules:

| Trigger | Clears | Keeps |
| --- | --- | --- |
| New visit (phone) | Progress, transcript, events, current session | Settings |
| Kiosk idle reset after certificate or entry | Progress, transcript, events, name, current session | Settings until staff reset |
| `?reset=1` / staff reset | Progress, transcript, events, settings, name | Nothing |
| Reload | Nothing | Progress and settings; transcript survives in `sessionStorage` for the tab |

---

## 5. Data contracts

### 5.1 Session schema

Use the PRD schema at `6.10.1` exactly. The M1 build adds only these allowed chapter status values: `locked`, `available`, `in_progress`, `complete`.

```json
{
  "schemaVersion": 1,
  "sessionId": "random-uuid-not-derived-from-device",
  "mode": "phone",
  "startedAt": "2026-10-23T10:00:00.000Z",
  "updatedAt": "2026-10-23T10:06:00.000Z",
  "stage": "chapter",
  "currentChapter": "tea",
  "chapters": {
    "tea": {
      "status": "in_progress",
      "storyBeat": 2,
      "qa": { "status": "not_started", "topicTag": null, "turns": 0, "sourceIds": [] },
      "interaction": { "status": "not_started", "attempts": 0, "usedSteadyMode": false },
      "quiz": { "status": "not_started", "attempts": 0, "firstTryCorrect": null },
      "card": { "variantId": null, "unlockedAt": null }
    },
    "bun": { "status": "locked" },
    "tart": { "status": "locked" }
  },
  "cards": [],
  "certificate": { "generatedAt": null, "downloadedAt": null, "sharedAt": null }
}
```

Storage keys are the PRD keys:

| Key | Storage | Contents |
| --- | --- | --- |
| `ccttm.progress.v1` | `localStorage` | Session schema; no name, no raw question text |
| `ccttm.transcript.v1` | `sessionStorage` | Q&A turns for review; pseudonymous session ID only |
| `ccttm.events.v1` | `localStorage` | Event buffer, capped at 2,000 |
| `ccttm.settings.v1` | `localStorage` | Audio/caption settings |

If storage is unavailable, continue in memory. Do not show a blocking error. A reload will lose progress; record that in the help copy, not in a scary banner.

### 5.2 Content schema

One file per chapter: `content/chapters/tea.dev.json`. The production file will replace it, not edit it in place.

```json
{
  "id": "tea",
  "devOnly": true,
  "contentVersion": "dev-0.1",
  "guideId": "tea_master",
  "title": "Silk-stockings milk tea",
  "oneIdea": "Craft",
  "beats": [
    {
      "id": "tea-b1",
      "text": "DEV PLACEHOLDER — STORY BEAT 1. This text stands in for the first approved story beat. The final version will introduce the object on the table and explain one cultural idea using only the curator fact sheet, in 70 to 110 spoken words. It will ship with a caption and a full transcript. Nothing in this paragraph is a factual claim about the food, its history or its makers; it exists so the layout, pagination, focus order and caption area can be tested before the content is approved.",
      "caption": "Development placeholder. Final caption pending source review.",
      "transcript": "Same text as the caption, available in full for screen readers.",
      "sourceIds": [],
      "audio": null
    }
  ],
  "interaction": {
    "type": "tea_pour",
    "pours": 4,
    "bpm": 72,
    "perfectMs": 120,
    "goodMs": 250,
    "requiredGood": 3,
    "steadyMode": true
  },
  "qa": {
    "maxTurns": 2,
    "suggested": [
      {
        "id": "tea-q1",
        "text": "What does steady mode do?",
        "topicTag": "craft",
        "fallbackSourceId": "DEV-QA-01"
      },
      {
        "id": "tea-q2",
        "text": "Can I skip a question?",
        "topicTag": "ratio",
        "fallbackSourceId": "DEV-QA-02"
      },
      {
        "id": "tea-q3",
        "text": "Where are the sources?",
        "topicTag": "origin",
        "fallbackSourceId": "DEV-QA-03"
      }
    ]
  },
  "quiz": {
    "question": "How many pours are in this practice round?",
    "options": ["Two", "Four", "Six"],
    "correctIndex": 1,
    "clue": "Count the beat markers.",
    "explanation": "The practice round uses four pours. This is a build-test question; the final order check will be written from the fact sheet.",
    "sourceId": "DEV-UI-02"
  },
  "cards": [
    {
      "variantId": "craft",
      "title": "The pour",
      "caption": "Development placeholder.",
      "fact": "Development placeholder — no cultural claim.",
      "sourceId": "DEV-UI-03",
      "crop": null
    }
  ],
  "defaultCardVariant": "craft"
}
```

The example shows one beat and one card. The actual file must contain exactly three beats and three card variants.

Rules:

- `devOnly: true` is required on every development file.
- Development beats may have empty `sourceIds`; the production validator must reject empty sources.
- Every production factual field needs a source ID that resolves in `content/sources.json`.
- The content loader must reject a chapter with missing required fields, an unknown guide, an unknown topic tag, an out-of-range `correctIndex`, a missing default variant or a card variant not present in `cards`.
- Do not edit a development file into production. Copy it to `tea.json`, replace every placeholder, add sources, set `devOnly` to `false`, and pass the production check.

### 5.3 Guide adapter

`assets/js/guide.js` exports one function:

```js
export async function askGuide(request) { /* returns response */ }
```

Request and response shapes are the PRD `6.6.4` contract:

```json
{
  "sessionId": "ephemeral-random-id",
  "chapterId": "tea",
  "personaId": "tea_master",
  "question": "string, max 120 characters",
  "history": [{ "role": "visitor", "content": "string" }],
  "mode": "phone"
}
```

```json
{
  "answer": "string, max 90 words",
  "sourceIds": ["DEV-QA-01"],
  "topicTag": "craft",
  "safety": "ok",
  "suggestedFollowUp": null
}
```

M1 mock behaviour:

- Resolve after 400 ms.
- Return a development answer from the local bank, never a cultural claim.
- Use the selected chip's `DEV-QA-xx` source ID, or `DEV-QA-01` for free text. Never return a cultural source ID.
- Return a `topicTag` in `craft`, `ratio` or `origin` to test card variants. For a chip, C4 uses the chip's pre-mapped topic; for free text, it uses the adapter's validated topic. The mock must not override a chip's topic.
- `?mock=fail` forces a timeout so the fallback path can be tested without a network.
- The mock is selected when `content/chapters/tea.dev.json` is loaded. A production build must refuse to start with the mock adapter.

The M1 owner must keep the adapter boundary exact so the production adapter can replace the mock without touching C4.

### 5.4 Telemetry events

Implement the PRD event names and fields. The M1 subset:

| Event | When | Required fields |
| --- | --- | --- |
| `session_start` | Start tapped | `mode`, `appVersion` |
| `intro_complete` | Order card first shown | `elapsedMs` |
| `chapter_start` | Chapter intro shown | `chapterId` |
| `story_beat_complete` | Each beat advanced | `chapterId`, `beatIndex`, `elapsedMs` |
| `qa_open` | Q&A step shown | `chapterId` |
| `qa_question_submit` | Chip or free text submitted | `chapterId`, `source` (`chip`/`free`), `latencyMs` |
| `qa_answer_render` | Answer shown | `chapterId`, `topicTag`, `fallback`, `safety`, `latencyMs` |
| `qa_skip` | Skip tapped | `chapterId` |
| `interaction_start` | Activity shown | `chapterId` |
| `interaction_attempt` | A pour resolves | `chapterId`, `attemptNumber`, `result` |
| `interaction_complete` | Activity completes | `chapterId`, `attempts`, `steadyMode` |
| `quiz_attempt` | Answer submitted | `chapterId`, `attemptNumber`, `correct` |
| `card_unlock` | Card awarded | `chapterId`, `variantId` |
| `chapter_complete` | Card reveal acknowledged | `chapterId`, `elapsedMs` |
| `scene_view` | Finale shown | `elapsedMs` |
| `certificate_generate` | PNG generated | `success`, `elapsedMs` |
| `certificate_download` | Download completed | `mode`, `method` |
| `session_reset` | Reset confirmed | `trigger` (`visitor`/`kiosk`/`staff`) |
| `error` | Recoverable or blocking failure | `code`, `chapterId`, `screen` |

Rules:

- Never log the certificate name, raw free-text questions, or any device identifier.
- `source` records chip vs free text. Both call the guide adapter; `fallback: true` marks a curated answer.
- Event export is JSON with a manifest: `appVersion`, `contentVersion`, export time and event count.
- Events fire once. Re-rendering a screen must not duplicate an event.

---

## 6. Development copy deck

Use these strings exactly until the content team replaces them. They contain no cultural claims.

| Slot | String |
| --- | --- |
| Global dev badge | “DEV BUILD — not for visitors” |
| AI disclosure (M1) | “AI guide (mock) — no live model in this build. Final answers will be grounded in curator sources.” |
| Story beat | “Development placeholder — final story text is pending source review.” |
| Audio control | “Narration not in this build.” |
| Q&A intro | “The live guide is not connected in this build. You are seeing a development sample.” |
| Q&A source line | “Source: development placeholder — not a cultural source.” |
| Q&A fallback | “The live guide is offline. Here is a development sample; your journey can continue.” |
| Quiz note | “This is a build-test question. The final order check will use approved content.” |
| Card fact | “Development placeholder — no cultural claim.” |
| Finale missing cards | “Chapters 2 and 3 will appear here when they are built.” |
| Certificate fine print | “Student-project prototype. AI-assisted interface; content pending review. Not an official heritage qualification.” |
| Reset confirmation | “Start a new visit? This clears progress, cards and questions on this device.” |

UI labels that contain no facts — buttons, navigation, progress, errors — may be treated as final if the content lead approves them.

Do not copy the proposal's four context figures or any historical dates into development copy. They are unverified and are not approved for display.

---

## 7. Placeholder and production gate

### 7.1 Development markers

All development content must carry at least one of:

- `devOnly: true` in the chapter file,
- a source ID beginning with `DEV-`,
- the string `[PLACEHOLDER]`,
- a visible “DEV BUILD” badge rendered by the app.

### 7.2 Production check

Create `scripts/check-content.mjs` and run it before every commit that touches `content/` and before any build:

Fail the check if:

- any `devOnly` is true,
- any source ID begins with `DEV-`,
- any string contains `[PLACEHOLDER]`,
- a factual field has no source ID,
- a source ID does not resolve in `content/sources.json`,
- a chapter is missing a required field or a card variant,
- a guide or topic tag is unknown.

The check exits non-zero. A build with a failing check cannot be called a release candidate.

### 7.3 Public-build rule

M1 must not be deployed to a public URL or shown to carnival visitors. The public build begins only when:

1. all three chapters use reviewed content,
2. the production check passes,
3. the live adapter and fallback bank pass the accuracy test,
4. final art and audio have licences,
5. accessibility and soak tests pass.

---

## 8. Accessibility and quality gates

M1 is not done until all of these pass on the tea slice plus the dev-complete finale.

- **Keyboard:** complete E1 → F2 using only Tab, Shift+Tab, Enter, Space and Escape. Visible focus ring. No focus trap except modals.
- **Screen reader:** test with NVDA on Chrome/Windows and VoiceOver on Safari/iOS. Headings, landmarks, form labels, live regions for the Q&A answer, and focus moved to the new screen heading after each transition.
- **Captions and transcripts:** every story beat has a caption and a full transcript. No information is carried by audio alone.
- **Reduced motion:** the tea stream, stamp, card flip and finale assembly have static alternatives. The activity remains completable.
- **Steady mode:** four taps at the visitor's own pace, no score, no timing failure.
- **Colour:** lock state, correctness and progress use text or shape as well as colour.
- **Contrast:** 4.5:1 for normal text, 3:1 for large text and interactive states.
- **Targets:** at least 44 × 44 CSS px.
- **Zoom:** 200% text zoom without clipped content or lost actions.
- **Responsive:** no horizontal scroll at 375 px; the kiosk layout works at 1024 × 768.
- **Offline:** load once, disconnect the network, complete tea and the certificate. No external requests.
- **Performance:** first interactive ≤3.0 s from local files; initial payload ≤2.5 MB gzipped; no external fonts, icons or analytics.
- **Stability:** 10 sequential dev sessions with no console errors, duplicated cards or corrupted storage.

---

## 9. M1 Definition of Done

M1 is complete when all of these are true:

- [ ] A fresh browser completes the tea chapter in 7 minutes or less with development copy.
- [ ] Reload at every step resumes the correct screen and state.
- [ ] The Q&A mock returns in under 1 second; the forced-failure path shows a fallback within 8.5 seconds.
- [ ] Two Q&A turns are allowed; a third is closed with the cap copy; Skip uses the default variant.
- [ ] Two wrong quiz attempts reveal the answer and still require the correct action; no card unlocks before the order is placed.
- [ ] The tea card unlocks once; the variant changes with the topic tag; reload does not duplicate it.
- [ ] `?dev=1` fills the bun and tart slots; F1 renders all three cards; F2 downloads a 1080 × 1350 PNG with and without a name.
- [ ] The name is never written to storage; reload clears it.
- [ ] Keyboard-only and screen-reader passes complete the whole path.
- [ ] Reduced motion and steady mode both complete the tea activity.
- [ ] Reset clears progress, transcript, events and settings; no stale visitor data remains.
- [ ] Kiosk attract at 45 seconds and certificate idle countdown work.
- [ ] Every M1 event fires once with the required fields; export JSON includes the manifest.
- [ ] The production content check fails on the development files.
- [ ] No external network calls, no console errors, no horizontal scroll at 375 px.

**M1 sign-off:** Members A and B demo on Thursday 29 October; Members C, D and E confirm that no development string makes a cultural claim; Member F confirms the placeholder art does not resemble a real shop, person or brand.

---

## 10. M2 — Remaining mechanics

M2 starts only after M1 sign-off. It reuses the shell; it does not add a new architecture.

### 10.1 Pineapple bun

Build the PRD `6.5.2` interaction:

- Split the warm bun → choose cold butter → close.
- Pineapple ring is a deliberate distractor; choosing it gives the correction and allows another choice.
- No drag; all ingredients are buttons.
- Hint after 12 seconds: “Start with the warm bun.”
- Reduced motion freezes the melt animation; the cross-section has a text description.
- The card unlocks only after the order check, not from the interaction.

### 10.2 Egg tart

Build the PRD `6.5.3` interaction:

- Two tarts, each with an inspect button; optional inspection before choosing.
- Cross-section view with a one-sentence texture note and a text description.
- Choose the puff-pastry school. Wrong choice gives a clue and allows another attempt.
- Do not rank one school as better. Do not claim a date beyond the fact sheet.
- The choice remains available if neither tart was inspected; a hint appears.

### 10.3 Three-chapter shell

- All three chapters use the same C1–C7 template.
- Three card variants per chapter (CSS placeholders in M2).
- The finale always has three slots.
- The sources modal covers all chapters.
- The certificate works with three cards.

### 10.4 M2 Definition of Done

- [ ] All three chapters complete with development copy in 20 minutes or less.
- [ ] All three interactions are keyboard-only completable.
- [ ] No interaction can unlock a card without its order check.
- [ ] The three-card finale and certificate work at 375 px and 1024 px.
- [ ] All accessibility gates in Section 8 pass across three chapters.
- [ ] No new factual claims were introduced in development copy.

---

## 11. Blocked inputs and drop-in points

| Missing input | Blocks | Drop-in point | Owner |
| --- | --- | --- | --- |
| Three fact sheets and claim-to-source tables | Final story, quiz and Q&A copy | `content/chapters/*.json`, `content/sources.json` | C/D/E |
| RAG corpus and guide prompts | Live Q&A | `content/corpus/*.json`, `content/prompts/*.md` | C/D/E |
| Provider, key, proxy and terms review | Live Q&A | `assets/js/guide.js` production adapter | A/B |
| 45-question accuracy and injection test | Public live Q&A | `content/tests/` and the test log | C/D/E + A/B |
| Three master illustrations and crops | Final cards, finale, certificate | `assets/img/cards/*.webp` | F + two reviewers |
| TTS scripts and voice files | Narration | `assets/audio/*.mp3`; enable the audio control | A/B + C/D/E |
| Booth device, power, network | Kiosk tuning | `config.js` breakpoints, idle timings | F + A/B |
| Web Share support | Sharing | `assets/js/certificate.js` | A/B |
| Full staff panel | S13 | `assets/js/staff.js`, `#/staff` | A/B |
| Single-file submission requirement | Packaging | `scripts/build-inline.mjs` | A/B |

Until an input arrives, use the M1 approach. Do not invent the input to unblock the build.

---

## 12. First five working days

| Day | A/B build | C/D/E content | F visual | Gate |
| --- | --- | --- | --- | --- |
| Fri 23 Oct | Repository, static skeleton, config, state module, dev/prod flag | Source-log template, fact-sheet v0.1 starts, UI copy for E1/E2/O1 | Placeholder card and certificate frames; art brief | Repo runs; content schema agreed |
| Mon 26 Oct | E1, E2, O1, hash routing, session persistence | Chapter copy structure, development Q&A bank, quiz test question | Order-card layout; card aspect ratio | Navigation and reload-resume work |
| Tue 27 Oct | C1, C2, content loader, transcript toggle | Beat placeholder length check; UI labels | Card reveal and detail layout | Tea intro and three beats work |
| Wed 28 Oct | C3, C4, mock adapter, fallback, events | Dev Q&A answers; privacy copy review | Finale composition with three placeholders | Interaction and Q&A work |
| Thu 29 Oct | C5, C6, C7, F1, F2, certificate PNG, accessibility pass, reset | Copy review; no-claim check | Certificate layout review | M1 demo and sign-off |

If the team does not work weekends, this is the five-day plan. If the timeline slips, cut in this order: C7 card detail modal → F1 assembly animation → X1 banner polish. Do not cut accessibility, the Q&A fallback, the order-check path or the certificate.

---

## 13. Handoff rules

For the build owner or coding agent:

1. Read this document, then PRD `6.5`, `6.6.4`, `6.10`, `6.11`, `6.12` and the screen list in `6.3`.
2. Do not add features, screens or dependencies that are not in this document.
3. Do not write historical copy. Use the development strings in Section 6.
4. Do not call a live API or add a key. The adapter is mocked in M1.
5. Keep development and production content in separate files. Never edit a dev file into production.
6. Preserve the storage keys and the session schema. If a field must change, update the schema and the migration together.
7. Run the production content check before every content commit.
8. Report any deviation from this spec before merging it.
9. Do not deploy M1 publicly or describe it as the final experience.
10. When a blocked input arrives, integrate it at the drop-in point in Section 11 without changing the screen contract.

---

**Bottom line:** M1 can start today with no verified facts, no API key, no final art and no audio. Build the tea slice and the full three-chapter shell, keep every placeholder visibly marked, and make the production gate fail loudly until the reviewed content replaces it.
