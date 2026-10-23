"""Create a static offline ZIP containing only explicitly allowed application files."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED


def main() -> None:
    """Package an offline delivery folder without configuration, Git or test environments."""
    root = Path(__file__).resolve().parents[1]
    destination = root / "dist/cha-chaan-teng-offline.zip"
    destination.parent.mkdir(exist_ok=True)
    files = [root / "index.html"]
    for folder in ("assets", "content"):
        files.extend(path for path in (root / folder).rglob("*") if path.is_file() and path.suffix != ".png")
    with ZipFile(destination, "w", ZIP_DEFLATED) as archive:
        for path in files:
            archive.write(path, path.relative_to(root).as_posix())
        archive.writestr("RUN.txt", "Internal development build. Serve this directory with python -m http.server 8000 and open http://127.0.0.1:8000/. All three chapters and PNG certificates work offline after initial load. This package uses local mock Q&A; it contains no API key or provider configuration. Cultural content and narration remain pending review.\n")
    with ZipFile(destination) as archive:
        names = archive.namelist()
        assert all(not name.startswith((".local/", ".git/", ".venv/")) for name in names)
        assert archive.testzip() is None
    print(f"Packaged {len(names)} files; {destination.stat().st_size} bytes; secret/config directories excluded.")


if __name__ == "__main__":
    main()
