"""Verify provider boundaries, grounded response validation and private-file isolation."""
import json
import threading
import unittest
import urllib.request
import urllib.error
from http.server import ThreadingHTTPServer
from server import AppHandler, validate_request, validate_answer, load_chapter


class ServerTests(unittest.TestCase):
    """Exercise HTTP behavior without sending test questions to a paid provider."""

    def test_request_and_grounding_boundaries(self) -> None:
        """Reject oversize input, wrong personas and invented citations."""
        chapter = load_chapter("bun")
        request = {"sessionId": "test", "chapterId": "bun", "personaId": "bakery_auntie", "question": "What goes inside?", "history": [], "mode": "phone"}
        self.assertEqual(validate_request(request)["chapterId"], "bun")
        with self.assertRaises(ValueError):
            validate_request({**request, "question": "x" * 121})
        with self.assertRaises(ValueError):
            validate_request({**request, "personaId": "tea_master"})
        answer = {"answer": "Choose cold butter in this activity.", "sourceIds": ["DEV-BUN-QA-02"], "topicTag": "butter", "safety": "ok", "suggestedFollowUp": None}
        self.assertEqual(validate_answer(answer, chapter)["topicTag"], "butter")
        with self.assertRaises(ValueError):
            validate_answer({**answer, "sourceIds": ["FAKE"]}, chapter)

    def test_http_never_serves_local_config_or_git(self) -> None:
        """The actual preview handler exposes only application assets and content."""
        server = ThreadingHTTPServer(("127.0.0.1", 0), AppHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base = f"http://127.0.0.1:{server.server_port}"
        try:
            for path in ("/.local/config.json", "/.git/config", "/%2e%2elocal/config.json", "/server.py", "/assets/../.local/config.json"):
                with self.assertRaises(urllib.error.HTTPError) as error:
                    urllib.request.urlopen(base + path)
                self.assertEqual(error.exception.code, 404)
            with urllib.request.urlopen(base + "/api/status") as response:
                status = json.load(response)
            self.assertNotIn("api_key", status)
            with urllib.request.urlopen(base + "/") as response:
                self.assertEqual(response.status, 200)
        finally:
            server.shutdown()
            server.server_close()


if __name__ == "__main__":
    unittest.main()
