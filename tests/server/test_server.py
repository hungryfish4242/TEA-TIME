"""Verify provider boundaries, grounded response validation and private-file isolation."""
import json
import tempfile
import threading
import unittest
import urllib.request
import urllib.error
from http.server import ThreadingHTTPServer
from pathlib import Path
from server import AppHandler, validate_request, validate_answer, load_chapter
import server


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


    def test_openai_protocol_builds_chat_request_and_parses_choice(self) -> None:
        """The OpenAI-compatible path posts chat/completions with bearer auth and parses choices."""
        payload = {"answer": "Steady mode removes timing.", "sourceIds": ["DEV-QA-01"], "topicTag": "craft", "safety": "ok", "suggestedFollowUp": None}
        config = {"enabled": True, "protocol": "openai", "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1", "api_key": "test-key", "model": "qwen-flash", "timeout_seconds": 7}
        captured: dict = {}

        class FakeResponse:
            """Stand in for a provider HTTP response without network access."""

            def __enter__(self) -> "FakeResponse":
                return self

            def __exit__(self, *args: object) -> bool:
                return False

            def read(self, limit: int) -> bytes:
                return json.dumps({"choices": [{"message": {"content": json.dumps(payload)}}]}).encode("utf-8")

        def fake_open(request: urllib.request.Request, timeout: float | None = None) -> FakeResponse:
            captured["url"] = request.full_url
            captured["headers"] = dict(request.headers)
            captured["body"] = json.loads(request.data.decode("utf-8"))
            return FakeResponse()

        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "config.json"
            path.write_text(json.dumps(config), encoding="utf-8")
            original_path, original_open = server.CONFIG_PATH, server.urllib.request.urlopen
            server.CONFIG_PATH, server.urllib.request.urlopen = path, fake_open
            try:
                result = server.ask_provider({"sessionId": "s", "chapterId": "tea", "personaId": "tea_master", "question": "What does steady mode do?", "history": [], "mode": "phone"})
            finally:
                server.CONFIG_PATH, server.urllib.request.urlopen = original_path, original_open
        self.assertTrue(captured["url"].endswith("/chat/completions"))
        self.assertEqual(captured["headers"].get("Authorization"), "Bearer test-key")
        self.assertEqual(captured["body"]["messages"][0]["role"], "system")
        self.assertEqual(captured["body"]["messages"][-1]["content"], "What does steady mode do?")
        self.assertEqual(result["topicTag"], "craft")

    def test_configuration_rejects_unlisted_provider_host(self) -> None:
        """Only allowlisted HTTPS provider hosts may be configured."""
        config = {"enabled": True, "protocol": "openai", "base_url": "https://evil.example.com/v1", "api_key": "test-key", "model": "qwen-flash"}
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "config.json"
            path.write_text(json.dumps(config), encoding="utf-8")
            original_path = server.CONFIG_PATH
            server.CONFIG_PATH = path
            try:
                with self.assertRaises(ValueError):
                    server.configuration()
            finally:
                server.CONFIG_PATH = original_path


if __name__ == "__main__":
    unittest.main()
