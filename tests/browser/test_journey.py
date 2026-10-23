"""Verify the real local interface with an existing Chromium installation."""
from __future__ import annotations

import functools
import http.server
import os
import struct
import threading
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright, Page

ROOT = Path(__file__).resolve().parents[2]


class JourneyTests(unittest.TestCase):
    """Exercise navigation, accessible controls and real browser state."""

    @classmethod
    def setUpClass(cls) -> None:
        """Serve the repository on an ephemeral local port."""
        handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
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
        self.assertTrue(self.page.get_by_role("button", name="Chapter 2 — coming in M2").is_disabled())

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


if __name__ == "__main__":
    unittest.main()
