"""Encode generated PNG masters as same-size WebP delivery assets using Chromium."""
from __future__ import annotations

import base64
import os
from pathlib import Path
from playwright.sync_api import sync_playwright


def main() -> None:
    """Preserve master pixels and dimensions while encoding browser delivery copies."""
    root = Path(__file__).resolve().parents[1]
    installed = sorted((Path(os.environ["LOCALAPPDATA"]) / "ms-playwright").glob("chromium-*/chrome-win64/chrome.exe"))
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=str(installed[-1]) if installed else None)
        page = browser.new_page()
        for name in ("tea", "bun", "tart"):
            source = root / "assets" / "img" / "cards" / f"{name}.png"
            data_url = "data:image/png;base64," + base64.b64encode(source.read_bytes()).decode("ascii")
            encoded = page.evaluate("""async url => {
                const image = new Image(); image.src = url; await image.decode();
                const canvas = document.createElement('canvas');
                canvas.width = image.width; canvas.height = image.height;
                canvas.getContext('2d').drawImage(image, 0, 0);
                return canvas.toDataURL('image/webp', 0.88).split(',')[1];
            }""", data_url)
            target = source.with_suffix(".webp")
            target.write_bytes(base64.b64decode(encoded))
            print(f"{target.name}: {target.stat().st_size} bytes")
        browser.close()


if __name__ == "__main__":
    main()
