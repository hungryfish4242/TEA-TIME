# Independent M1 review and fixes

A fresh read-only reviewer inspected the source, plan, requirements and tests. It independently ran the 23-test Node suite before the added regression cases. Its verdict was to fix five issues before handoff. No second reviewer pass is claimed; fixes are verified by failing-then-passing regression tests.

| Finding | Fix | Regression |
| --- | --- | --- |
| Quota fallback prevented reset from deleting earlier on-disk data | Reset always attempts actual removal per key, even after write fallback; reports an actual browser refusal to clear data | `quota failure does not prevent reset from clearing older disk progress and transcript` |
| Skip-to-content changed the application hash and returned to entry | Prevent default hash navigation and focus the current main element | `test_skip_link_stays_in_current_chapter` |
| Structurally corrupt events, transcripts or completed-card state could crash a screen | Validate stored elements and session cross-field invariants at their boundaries | Event/state unit regressions and `test_corrupt_transcript_is_discarded` |
| Reduced-motion preference did not stop the JavaScript rhythm marker | Starting practice under reduced motion uses the static, untimed steady mode | `test_reduced_motion_rhythm_uses_static_feedback` |
| A late old timeout wrote an error into a new visit's log | Verify request token, visit and route before fallback side effects | `test_late_timeout_does_not_recreate_reset_events` |

The executor also reproduced a stale native dialog close event cancelling a newly opened kiosk countdown under accelerated time. Ignore a queued close event when the dialog has already reopened. The cancel/reopen/reset browser test exercises this path.

The reviewer's initial hypothesis about a user replacing an idle dialog through background controls was withdrawn because a normal user could not reach that path. It is not an outstanding finding.

No deferred minor findings. Physical-device browsers, assistive technologies, actual browser/text zoom, cultural accuracy and course-team artwork approval remain the explicit manual acceptance boundaries in the verification record. The automated tests do not substitute for them.
