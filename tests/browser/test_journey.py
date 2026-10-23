"""Verify the real local interface with an existing Chromium installation."""
from __future__ import annotations

import functools
import json
import http.server
import os
import struct
import threading
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright, Page
from server import AppHandler

ROOT = Path(__file__).resolve().parents[2]


class OfflineAppHandler(AppHandler):
    """Reuse the private-file allowlist while preventing paid calls in browser regressions."""

    live_enabled = False


class JourneyTests(unittest.TestCase):
    """Exercise navigation, accessible controls and real browser state."""

    @classmethod
    def setUpClass(cls) -> None:
        """Serve the repository on an ephemeral local port."""
        handler = OfflineAppHandler
        cls.server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f"http://127.0.0.1:{cls.server.server_port}"
        cls.playwright = sync_playwright().start()
        installed = sorted((Path(os.environ["LOCALAPPDATA"]) / "ms-playwright").glob("chromium-*/chrome-win64/chrome.exe"))
        cls.browser = cls.playwright.chromium.launch(headless=True, executable_path=str(installed[-1]) if installed else None)

    @classmethod
    def tearDownClass(cls) -> None:
        """Close browser and the test-owned server."""
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self) -> None:
        """Use an isolated browser context for each visitor."""
        self.context = self.browser.new_context(viewport={"width": 375, "height": 667})
        self.page: Page = self.context.new_page()
        self.page.set_default_timeout(10000)
        self.errors: list[str] = []
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))

    def tearDown(self) -> None:
        """Require no unhandled browser exceptions."""
        self.context.close()
        self.assertEqual(self.errors, [])

    def open(self, query: str = "") -> None:
        """Wait until local content and the shell are ready."""
        self.page.goto(self.url + "/" + query)
        self.page.wait_for_selector("[data-ready='true']")

    def start_story(self) -> None:
        """Reach the first tea story beat through public controls."""
        self.page.get_by_role("button", name="Begin my order").click()
        self.page.get_by_role("button", name="Visit the tea table", exact=True).click()
        self.page.get_by_role("button", name="Begin the story").click()

    def test_entry_story_reload_and_locked_routes(self) -> None:
        """A visitor resumes the completed story checkpoint after reload."""
        self.open()
        self.start_story()
        self.page.get_by_role("button", name="Next beat").click()
        self.page.reload()
        self.page.wait_for_selector("[data-ready='true']")
        self.assertIn("Beat 2 of 3", self.page.locator("main").text_content())
        self.page.goto(self.url + "/#/bun")
        self.page.wait_for_url("**/#/order")
        self.assertTrue(self.page.get_by_role("button", name="Visit the bun table").is_disabled())

    def test_modal_focus_and_phone_layout(self) -> None:
        """Dialogs restore focus; entry remains within a phone viewport."""
        self.open()
        trigger = self.page.get_by_role("button", name="How it works", exact=True)
        trigger.click()
        self.assertTrue(self.page.locator("dialog[open]").is_visible())
        self.page.keyboard.press("Escape")
        self.assertTrue(trigger.evaluate("el => el === document.activeElement"))
        self.assertLessEqual(self.page.evaluate("document.documentElement.scrollWidth"), 375)
        self.assertTrue(self.page.locator(".hero-cup img").evaluate("img => img.complete && img.naturalWidth > 1000"))

    def reach_practice(self) -> None:
        """Complete the three story beats."""
        self.start_story()
        for _ in range(2):
            self.page.get_by_role("button", name="Next beat").click()
        self.page.get_by_role("button", name="Try the practice").click()

    def test_steady_mode_resume_and_completion(self) -> None:
        """No-timing practice persists taps and completes with reduced motion."""
        self.context.close()
        self.context = self.browser.new_context(viewport={"width": 375, "height": 667}, reduced_motion="reduce")
        self.page = self.context.new_page()
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))
        self.open()
        self.reach_practice()
        self.page.get_by_role("button", name="Use steady mode", exact=True).click()
        for _ in range(2):
            self.page.get_by_role("button", name="Pour", exact=True).press("Enter")
            self.page.wait_for_timeout(300)
        self.page.reload()
        self.page.wait_for_selector("[data-ready='true']")
        self.assertIn("2 of 4 pours", self.page.locator("main").inner_text())
        self.page.get_by_role("button", name="Resume practice", exact=True).click()
        for _ in range(2):
            self.page.get_by_role("button", name="Pour", exact=True).press("Enter")
            self.page.wait_for_timeout(300)
        self.assertIn("Practice complete", self.page.locator("main").inner_text())

    def reach_qa(self) -> None:
        """Complete the practice using the accessible four-tap mode."""
        self.reach_practice()
        self.page.get_by_role("button", name="Use steady mode", exact=True).click()
        for _ in range(4):
            self.page.get_by_role("button", name="Pour", exact=True).click()
            self.page.wait_for_timeout(260)
        self.page.get_by_role("button", name="Continue", exact=False).click()

    def test_qa_two_turns_quiz_and_unique_variant(self) -> None:
        """Two questions cap the guide and quiz correction still requires action."""
        self.open()
        self.reach_qa()
        self.page.get_by_role("button", name="Can I skip a question?", exact=True).click()
        self.page.wait_for_selector(".answer")
        self.page.get_by_role("button", name="Where are the sources?", exact=True).click()
        self.page.wait_for_selector("#qa-cap")
        self.assertTrue(self.page.get_by_role("button", name="What does steady mode do?", exact=True).is_disabled())
        self.page.get_by_role("button", name="Check my order", exact=True).click()
        self.page.get_by_role("button", name="Two", exact=True).click()
        self.page.get_by_role("button", name="Six", exact=True).click()
        self.assertEqual(self.page.evaluate("JSON.parse(localStorage.getItem('ccttm.progress.v1')).cards"), [])
        self.page.get_by_role("button", name="Place my order", exact=True).click()
        self.assertIn("At the counter", self.page.locator("main").inner_text())
        self.page.reload()
        self.page.wait_for_selector("[data-ready='true']")
        self.assertEqual(self.page.evaluate("JSON.parse(localStorage.getItem('ccttm.progress.v1')).cards"), ["tea"])

    def test_mock_failure_falls_back_and_skip_uses_default(self) -> None:
        """A failed guide never blocks a visitor or changes the skip variant."""
        self.open("?mock=fail")
        self.reach_qa()
        self.page.get_by_role("button", name="What does steady mode do?", exact=True).click()
        self.page.wait_for_selector(".answer", timeout=8500)
        self.assertIn("development sample", self.page.locator(".answer").inner_text())
        self.page.get_by_role("button", name="Skip for now", exact=True).click()
        self.page.get_by_role("button", name="Four", exact=True).click()
        self.assertIn("The pour", self.page.locator("main").inner_text())

    def reach_certificate(self) -> None:
        """Collect tea and fill the explicitly development-only card slots."""
        self.reach_qa()
        self.page.get_by_role("button", name="Skip for now", exact=True).click()
        self.page.get_by_role("button", name="Four", exact=True).click()
        self.page.get_by_role("button", name="Collect my card", exact=True).click()
        self.page.get_by_role("button", name="Complete remaining chapters", exact=True).click()
        self.page.get_by_role("button", name="See the three-card scene").click()
        self.page.get_by_role("button", name="Make my certificate").click()
        self.page.get_by_label("Your nickname (optional)").wait_for()

    def test_certificate_download_dimensions_name_privacy_and_reload(self) -> None:
        """Download a real PNG and verify the optional name never persists."""
        self.open("?dev=1")
        self.reach_certificate()
        self.page.get_by_label("Your nickname (optional)").fill("<b>Alex</b> ☕")
        with self.page.expect_download() as info:
            self.page.get_by_role("button", name="Download my certificate", exact=True).click()
        path = ROOT / "tmp" / "certificate-test.png"
        info.value.save_as(path)
        data = path.read_bytes()
        self.assertEqual(data[:8], b"\x89PNG\r\n\x1a\n")
        self.assertEqual(struct.unpack(">II", data[16:24]), (1080, 1350))
        self.assertNotIn("Alex", self.page.evaluate("JSON.stringify({...localStorage,...sessionStorage})"))
        self.page.reload()
        self.page.wait_for_selector("[data-ready='true']")
        self.assertEqual(self.page.get_by_label("Your nickname (optional)").input_value(), "")
        with self.page.expect_download():
            self.page.get_by_role("button", name="Download my certificate", exact=True).click()

    def test_staff_reset_and_kiosk_countdown(self) -> None:
        """Staff reset clears settings; a kiosk visitor can cancel an idle reset."""
        self.page.clock.install()
        self.open("?dev=1&mode=kiosk")
        self.reach_certificate()
        self.page.clock.fast_forward(60000)
        self.page.get_by_role("button", name="Keep looking", exact=True).wait_for()
        self.page.get_by_role("button", name="Keep looking", exact=True).click()
        self.assertFalse(self.page.locator("dialog").is_visible())
        self.page.clock.fast_forward(60000)
        self.page.clock.fast_forward(10000)
        self.page.wait_for_function("location.hash === '#/'")
        self.assertIsNone(self.page.evaluate("localStorage.getItem('ccttm.progress.v1')"))
        self.page.evaluate("localStorage.setItem('ccttm.settings.v1', JSON.stringify({captions:true}))")
        self.page.goto(self.url + "/?reset=1")
        self.page.get_by_role("button", name="Reset everything", exact=True).click()
        self.assertIsNone(self.page.evaluate("localStorage.getItem('ccttm.settings.v1')"))

    def test_offline_ten_visits_no_duplicate_cards_or_external_requests(self) -> None:
        """A preloaded kiosk can complete ten visits after losing all network access."""
        external: list[str] = []
        self.page.on("request", lambda request: external.append(request.url) if not request.url.startswith(self.url) else None)
        self.open("?dev=1")
        self.context.set_offline(True)
        for _ in range(10):
            self.reach_certificate()
            self.assertEqual(self.page.evaluate("JSON.parse(localStorage.getItem('ccttm.progress.v1')).cards"), ["tea", "bun", "tart"])
            self.page.get_by_role("button", name="Start a new visit", exact=True).click()
            self.page.locator("dialog").get_by_role("button", name="Start a new visit", exact=True).click()
            self.page.wait_for_function("location.hash === '#/'")
            self.assertIsNone(self.page.evaluate("sessionStorage.getItem('ccttm.transcript.v1')"))
        self.assertEqual(external, [])

    def test_layout_and_generated_art_screenshots(self) -> None:
        """Save reproducible visual evidence at phone and kiosk sizes."""
        self.open("?dev=1")
        ready_ms = self.page.evaluate("performance.now()")
        self.assertLess(ready_ms, 3000)
        (ROOT / "tmp" / "browser-metrics.json").write_text(json.dumps({"browser": self.browser.version, "localReadyMs": round(ready_ms, 2)}, indent=2), encoding="utf-8")
        for width, height in ((375, 667), (1024, 768), (1440, 1000)):
            self.page.set_viewport_size({"width": width, "height": height})
            self.assertLessEqual(self.page.evaluate("document.documentElement.scrollWidth"), width)
            self.page.screenshot(path=str(ROOT / "tmp" / f"entry-{width}.png"), full_page=True)
        self.reach_certificate()
        self.page.screenshot(path=str(ROOT / "tmp" / "certificate-studio.png"), full_page=True)
        self.page.set_viewport_size({"width": 375, "height": 667})
        self.assertLessEqual(self.page.evaluate("document.documentElement.scrollWidth"), 375)

    def test_denied_storage_property_uses_memory(self) -> None:
        """Storage denial at the Window getter must not prevent startup."""
        self.context.add_init_script("Object.defineProperty(window, 'localStorage', {get() {throw new DOMException('Blocked by browser', 'SecurityError')}})")
        self.open()
        self.start_story()
        self.page.get_by_role("button", name="Help & settings", exact=True).click()
        self.assertIn("works in memory", self.page.locator("dialog").inner_text())

    def key_activate(self, name: str, exact: bool = False) -> None:
        """Reach a named button using only Tab and activate it with Enter."""
        button = self.page.get_by_role("button", name=name, exact=exact)
        button.wait_for()
        for _ in range(80):
            if button.evaluate("el => el === document.activeElement"):
                self.page.keyboard.press("Enter")
                return
            self.page.keyboard.press("Tab")
        self.fail(f"Keyboard could not reach {name}")

    def test_keyboard_only_journey(self) -> None:
        """Complete the visitor route and PNG download entirely from the keyboard."""
        self.open("?dev=1")
        for name in ("Begin my order", "Visit the tea table", "Begin the story", "Next beat", "Next beat", "Try the practice", "Use steady mode"):
            self.key_activate(name)
        for _ in range(4):
            self.key_activate("Pour", exact=True)
            self.page.wait_for_timeout(300)
        for name in ("Continue", "Skip for now", "Four", "Collect my card", "Complete remaining chapters", "See the three-card scene", "Make my certificate"):
            self.key_activate(name)
        with self.page.expect_download():
            self.key_activate("Download my certificate")

    def test_skip_link_stays_in_current_chapter(self) -> None:
        """Skipping repeated navigation focuses the existing chapter body."""
        self.open()
        self.start_story()
        self.page.get_by_role("link", name="Skip to content").press("Enter")
        self.assertEqual(self.page.evaluate("location.hash"), "#/tea")
        self.assertTrue(self.page.locator("main").evaluate("el => el === document.activeElement"))

    def test_corrupt_transcript_is_discarded(self) -> None:
        """Malformed tab storage cannot crash a valid Q&A checkpoint."""
        self.open()
        self.reach_qa()
        self.page.evaluate("sessionStorage.setItem('ccttm.transcript.v1', JSON.stringify({sessionId:JSON.parse(localStorage.getItem('ccttm.progress.v1')).sessionId,turns:[null]}))")
        self.page.reload()
        self.page.wait_for_selector("[data-ready='true']")
        self.assertTrue(self.page.get_by_role("button", name="What does steady mode do?", exact=True).is_visible())

    def test_reduced_motion_rhythm_uses_static_feedback(self) -> None:
        """Even the default practice control honors reduced-motion preference."""
        self.page.emulate_media(reduced_motion="reduce")
        self.open()
        self.reach_practice()
        self.page.get_by_role("button", name="Start rhythm practice", exact=True).click()
        self.assertFalse(self.page.locator(".rhythm").is_visible())

    def test_late_timeout_does_not_recreate_reset_events(self) -> None:
        """A pending old visit cannot add events after a visitor reset."""
        self.page.clock.install()
        self.open("?mock=fail")
        self.reach_qa()
        self.page.get_by_role("button", name="What does steady mode do?", exact=True).click()
        self.page.get_by_role("button", name="Help & settings", exact=True).click()
        self.page.locator("dialog").get_by_role("button", name="Start a new visit", exact=True).click()
        self.page.locator("dialog").get_by_role("button", name="Start a new visit", exact=True).click()
        self.page.get_by_role("button", name="Begin my order").wait_for()
        self.page.clock.fast_forward(9000)
        self.assertIsNone(self.page.evaluate("localStorage.getItem('ccttm.events.v1')"))
        self.assertIsNone(self.page.evaluate("sessionStorage.getItem('ccttm.transcript.v1')"))

    def finish_food_table(self, chapter: str) -> None:
        """Finish either new chapter using keyboard actions and recover from a distractor."""
        self.key_activate(f"Visit the {chapter} table")
        for name in ("Begin the story", "Next beat", "Next beat", "Try the practice"):
            self.key_activate(name)
        if chapter == "bun":
            for name in ("Split the warm bun", "Pineapple ring", "Cold butter", "Place and close"):
                self.key_activate(name, exact=True)
        else:
            for name in ("Inspect shortcrust", "Choose shortcrust", "Inspect puff pastry", "Choose puff pastry"):
                self.key_activate(name, exact=True)
        self.assertNotIn(chapter, self.page.evaluate("JSON.parse(localStorage.getItem('ccttm.progress.v1')).cards"))
        self.key_activate("Continue")
        self.key_activate("Skip for now")
        self.key_activate("Cold butter" if chapter == "bun" else "Puff pastry", exact=True)
        self.key_activate("Collect my card", exact=True)

    def test_normal_three_chapter_journey(self) -> None:
        """Complete all chapters and the certificate without development shortcuts."""
        self.open()
        self.reach_qa()
        self.key_activate("Skip for now")
        self.key_activate("Four", exact=True)
        self.key_activate("Collect my card", exact=True)
        self.finish_food_table("bun")
        self.assertTrue(self.page.locator("body").evaluate("el=>el.classList.contains('all-unlocked')"))
        self.finish_food_table("tart")
        self.assertEqual(self.page.evaluate("JSON.parse(localStorage.getItem('ccttm.progress.v1')).cards"), ["tea", "bun", "tart"])
        self.key_activate("See the three-card scene")
        self.key_activate("Make my certificate")
        with self.page.expect_download():
            self.key_activate("Download my certificate")

    def test_share_without_device_support_downloads_png(self) -> None:
        """Unsupported native sharing still produces a real downloadable PNG."""
        self.open("?dev=1")
        self.reach_certificate()
        self.page.evaluate("Object.defineProperty(navigator, 'canShare', {value: () => false, configurable:true})")
        with self.page.expect_download() as result:
            self.page.get_by_role("button", name="Share certificate", exact=True).click()
        self.assertEqual(result.value.suggested_filename, "cha-chaan-teng-certificate.png")

    def test_delayed_share_cannot_write_into_a_reset_visit(self) -> None:
        """An old share rejection cannot download or log data for a new visitor."""
        self.open("?dev=1")
        self.reach_certificate()
        downloads: list[str] = []
        self.page.on("download", lambda download: downloads.append(download.suggested_filename))
        self.page.evaluate("Object.defineProperty(navigator,'canShare',{value:()=>true,configurable:true});Object.defineProperty(navigator,'share',{value:()=>new Promise((resolve,reject)=>{window.rejectShare=reject}),configurable:true})")
        self.page.get_by_role("button", name="Share certificate", exact=True).click()
        self.page.wait_for_function("typeof window.rejectShare === 'function'")
        self.page.get_by_role("button", name="Start a new visit", exact=True).click()
        self.page.locator("dialog").get_by_role("button", name="Start a new visit", exact=True).click()
        self.page.get_by_role("button", name="Begin my order").wait_for()
        self.page.evaluate("window.rejectShare(new DOMException('Not available','NotAllowedError'))")
        self.page.wait_for_timeout(200)
        self.assertEqual(downloads, [])
        self.assertIsNone(self.page.evaluate("localStorage.getItem('ccttm.events.v1')"))

    def test_test_server_denies_private_paths(self) -> None:
        """The test harness cannot expose private project directories either."""
        response = self.page.request.head(self.url + "/.local/config.json")
        self.assertIn(response.status, (404, 405))

    def test_welcome_unlock_cancel_confirm_reload_and_initialize(self) -> None:
        """Five welcome activations require consent and unlock access without giving cards."""
        self.open()
        welcome = self.page.get_by_role("button", name="WELCOME IN", exact=True)
        for _ in range(4):
            welcome.click()
        self.assertFalse(self.page.locator("dialog").is_visible())
        welcome.click()
        self.page.keyboard.press("Escape")
        self.assertEqual(self.page.evaluate("localStorage.getItem('ccttm.progress.v1')"), None)
        for _ in range(5):
            welcome.click()
        self.page.get_by_role("button", name="Unlock all levels", exact=True).click()
        self.assertTrue(self.page.locator("body").evaluate("el=>el.classList.contains('all-unlocked')"))
        self.assertEqual(self.page.evaluate("JSON.parse(localStorage.getItem('ccttm.progress.v1')).cards"), [])
        self.page.reload()
        self.page.wait_for_selector("[data-ready='true']")
        self.page.get_by_role("button", name="Begin my order").click()
        self.assertTrue(self.page.get_by_role("button", name="Visit the tart table").is_enabled())
        self.page.get_by_role("button", name="Initialize levels", exact=True).click()
        self.page.locator("dialog").get_by_role("button", name="Initialize levels", exact=True).click()
        self.page.get_by_role("button", name="Begin my order").click()
        self.assertTrue(self.page.get_by_role("button", name="Visit the bun table").is_disabled())
        self.assertFalse(self.page.locator("body").evaluate("el=>el.classList.contains('all-unlocked')"))

    def test_idle_rhythm_does_not_add_pours(self) -> None:
        """Elapsed beats are not visitor input and cannot advance a practice round."""
        self.page.clock.install()
        self.open()
        self.reach_practice()
        self.page.get_by_role("button", name="Start rhythm practice", exact=True).click()
        self.page.clock.run_for(6000)
        self.assertIn("0 of 4 pours", self.page.locator("#pour-count").inner_text())
        self.assertFalse(self.page.locator("#practice-continue").is_visible())

    def test_story_render_preserves_vertical_scroll(self) -> None:
        """Replacing a story beat does not animate the viewport back to the page top."""
        self.open()
        self.start_story()
        self.page.evaluate("window.scrollTo({top:300,behavior:'instant'})")
        before = self.page.evaluate("window.scrollY")
        self.page.locator('[data-action="next-beat"]').evaluate("el=>el.click()")
        self.page.wait_for_timeout(400)
        self.assertLess(abs(self.page.evaluate("window.scrollY") - before), 3)


if __name__ == "__main__":
    unittest.main()
