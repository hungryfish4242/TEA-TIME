"""Verify one real browser-to-DeepSeek question and capture the live guide and new table screens."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "tests/browser"))
from test_journey import JourneyTests


def main() -> None:
    """Exercise the running local server without reading or displaying secret configuration."""
    JourneyTests.setUpClass()
    case = JourneyTests("test_normal_three_chapter_journey")
    case.setUp()
    case.url = "http://127.0.0.1:8000"
    try:
        case.page.set_viewport_size({"width": 1024, "height": 768})
        case.open()
        case.reach_qa()
        case.page.get_by_role("button", name="What does steady mode do?", exact=True).click()
        case.page.locator(".answer").wait_for(timeout=9000)
        event = case.page.evaluate("JSON.parse(localStorage.getItem('ccttm.events.v1')).find(e=>e.name==='qa_answer_render').fields")
        if event["fallback"]:
            raise AssertionError("The real browser request fell back instead of using a provider answer")
        case.page.screenshot(path=str(ROOT / "tmp/live-guide.png"), full_page=True)
        for name in ("Check my order", "Four", "Collect my card"):
            case.key_activate(name)
        for chapter in ("bun", "tart"):
            case.key_activate(f"Visit the {chapter} table")
            for name in ("Begin the story", "Next beat", "Next beat", "Try the practice"):
                case.key_activate(name)
            case.page.screenshot(path=str(ROOT / f"tmp/{chapter}-activity-1024.png"), full_page=True)
            assert case.page.evaluate("document.documentElement.scrollWidth") <= 1024
            actions = ("Split the warm bun", "Cold butter", "Place and close") if chapter == "bun" else ("Inspect puff pastry", "Choose puff pastry")
            for name in actions:
                case.key_activate(name, exact=True)
            for name in ("Continue", "Skip for now", "Cold butter" if chapter == "bun" else "Puff pastry", "Collect my card"):
                case.key_activate(name)
        print(json.dumps({"browserLiveAnswer": True, "fallback": event["fallback"], "latencyMs": event["latencyMs"], "threeChaptersAt1024": True}))
    finally:
        case.tearDown()
        JourneyTests.tearDownClass()


if __name__ == "__main__":
    main()
