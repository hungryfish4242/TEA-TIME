# Unlock, rhythm and scroll implementation plan

User explicitly requested this change and the existing test/commit/continue workflow applies. Reviewed against the current state, activity and render code before implementation.

1. Five activations of the home WELCOME IN control open a confirmation. Confirm makes every locked chapter available, retaining earned cards and current progress. Cancel changes nothing. This unlocks access, not completion; quizzes still award cards. Use the existing chapter status fields without adding a storage migration.
2. When all chapters are accessible, by normal progression or this shortcut, show a restrained gold treatment and a short confetti burst. Respect reduced motion. Add an Initialize levels option with confirmation; reset progress, transcripts/events and unlock state through the existing visit-reset path.
3. Rhythm diagnosis: tick currently calls resolve('miss') when no input occurs, which increments lastCompletedPour and eventually grants completion on retry. Remove automatic input resolution: an unanswered beat loops without advancing progress. Explicit off-beat taps still count as attempts under the original forgiving retry rule; rapid taps remain deduplicated.
4. Scroll diagnosis: every render calls window.scrollTo(0,0), while the stylesheet enables smooth scrolling. Preserve the old vertical offset, clamped to the new document height, restore instantly and disable automatic history scroll restoration. Keep focus management with preventScroll.

Verification: failing browser regressions for idle practice, scroll preservation, five-click cancel/confirm, reload persistence, natural unlock celebration and reset. Unit test unlock without card grants/preserving earned progress. Run Node, backend and full browser suites; rebuild offline ZIP; commit checked changes. No new dependencies or live API calls are needed for these tests.
