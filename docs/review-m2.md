# M2 independent review and regression fixes

A fresh read-only reviewer inspected M2, live integration and sharing. It independently ran 35 Node tests and identified three material issues. All received failing regression cases before fixes:

1. The browser-test server still exposed the source checkout. Tests now use the same allowlisted handler as the preview, with live mode explicitly disabled. A HEAD regression verifies private paths are denied. No credentials were inspected by the reviewer or printed by the tests.
2. Backend answers could cite chapter UI sources that the frontend rejected. Frontend and backend now accept the same QA/UI source set; literal source tests cover each chapter, and the live-browser fixture returns a UI citation. Of the original 45 successful backend evaluation results, 17 exercised this gap; those backend results were not represented as successful frontend displays.
3. A native share operation resolving after reset could download an old visitor's image or write events into the new visit. The app rechecks visit identity after the asynchronous share call. A delayed-share rejection regression verifies no old download or new-visit event occurs.

An additional executor regression prevents the optional developer completion shortcut from overwriting an already earned chapter/card.

No reviewer finding is deferred. Native sharing on a real mobile device, Safari/Android, assistive technology and final cultural/audio review remain explicitly unverified external acceptance work.
