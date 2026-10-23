"""Verify live-mode disclosure and same-origin transport with a deterministic backend fixture."""
import json
import unittest
import test_journey as journey
from playwright.sync_api import Route


class LiveModeTests(journey.JourneyTests):
    """Exercise the live transport without spending tokens during regression runs."""

    def test_live_request_and_disclosure(self) -> None:
        """The browser sends only the guide contract and renders the validated answer."""
        requests: list[dict] = []

        def respond(route: Route) -> None:
            """Capture the actual application request at the HTTP boundary."""
            requests.append(route.request.post_data_json)
            route.fulfill(status=200, content_type="application/json", body=json.dumps({"answer": "Choose steady mode for four untimed taps.", "sourceIds": ["DEV-UI-02"], "topicTag": "craft", "safety": "ok", "suggestedFollowUp": None}))

        self.page.route("**/api/guide", respond)
        self.open()
        self.page.locator('meta[name="guide-mode"]').evaluate("el => el.content = 'live'")
        self.reach_qa()
        self.assertIn("sent to DeepSeek", self.page.locator("main").inner_text())
        self.page.get_by_role("button", name="What does steady mode do?", exact=True).click()
        self.page.locator(".answer").wait_for()
        self.assertEqual(requests[0]["chapterId"], "tea")
        self.assertNotIn("api_key", requests[0])
        self.assertIn("four untimed taps", self.page.locator(".answer").inner_text())


def load_tests(loader: unittest.TestLoader, tests: unittest.TestSuite, pattern: str | None) -> unittest.TestSuite:
    """Run only this class's added test instead of duplicating inherited journeys."""
    return unittest.TestSuite([LiveModeTests("test_live_request_and_disclosure")])
