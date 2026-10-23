# Local DeepSeek guide

The user explicitly supplied the endpoint, model and key and requested local configuration. The secret is stored only in ignored `.local/config.json`. Do not copy it into JavaScript, screenshots, command logs, packages or Git.

Run `uv run python server.py --port 8000`. The server binds to loopback, serves only allowlisted application assets and provides `/api/status` and `/api/guide`. Browser code never receives the key. Static offline packages retain mock answers; `?offline=1` forces that mode on the local server as well.

The provider base is `https://api.deepseek.com/anthropic`, model `deepseek-flash`. The server uses the Anthropic `/v1/messages` contract, `x-api-key`, non-streaming responses, disabled thinking and at most 450 output tokens. These choices follow [DeepSeek's Anthropic compatibility documentation](https://api-docs.deepseek.com/guides/anthropic_api/) and [thinking-mode documentation](https://api-docs.deepseek.com/guides/thinking_mode/).

Requests are limited to 120 question characters, the current table's conversation, six provider requests per visit and a 7-second server timeout. The browser imposes an 8-second deadline and falls back to the current table's local bank. Host/Origin checks and JSON-only POSTs prevent foreign-site browser calls. Request bodies, credentials and provider responses are not persisted in server logs. Provider retention is governed by DeepSeek's terms; no no-training or deletion guarantee is asserted here.

The model receives only the chapter-specific development source descriptions and instructions to refuse unsupported cultural claims. Responses must have at most 90 words, a valid topic, known source IDs, safety status and no HTML. This is real model integration, but the available corpus is still interface material: it is not a completed cultural-history RAG corpus.

Initial real call succeeded in 1,063 ms with a 31-word answer and source `DEV-QA-01`. Subsequent automated grounding/contract evaluation is recorded separately; neither replaces human cultural review.
