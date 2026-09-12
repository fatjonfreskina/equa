from datetime import date
from pathlib import Path

import pytest

from scripts.check_release import parse_changelog, validate_release


def write_release_files(
    root: Path,
    *,
    frontend: str = "1.8.1",
    backend: str = "1.8.1",
    heading: str = "## [1.8.1] Frontend; Backend",
    body: str = "### Corretto\n\n- Una correzione.",
):
    files = {
        "frontend/src/config.ts": f"export const APP_VERSION = '{frontend}'",
        "backend/app/main.py": (
            f'app = FastAPI(title="Equa API", version="{backend}")'
        ),
        "doc/CHANGELOG.md": f"# Changelog\n\n{heading} - {date.today()}\n\n{body}\n",
    }
    for relative_path, content in files.items():
        path = root / relative_path
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")


def test_release_metadata_matches_versions_and_increments(tmp_path):
    write_release_files(tmp_path)

    assert validate_release(tmp_path, {"frontend": "1.8.0", "backend": "1.8.0"}) == {
        "frontend": "1.8.1",
        "backend": "1.8.1",
    }


def test_release_can_increment_only_one_component(tmp_path):
    write_release_files(
        tmp_path,
        backend="1.8.0",
        heading="## [1.8.1] Frontend",
        body=(
            "### Modificato\n\n- Frontend aggiornato.\n\n"
            "## [1.8.0] Backend - 2026-09-10\n\n"
            "### Modificato\n\n- Backend precedente."
        ),
    )

    assert validate_release(tmp_path, {"frontend": "1.8.0", "backend": "1.8.0"}) == {
        "frontend": "1.8.1",
        "backend": "1.8.0",
    }


@pytest.mark.parametrize(
    "frontend,heading,body,error",
    [
        ("1.8.2", "## [1.8.1] Frontend; Backend", "- Modifica.", "Versione frontend"),
        ("1.8.1", "## [1.8.1] Frontend; Backend", "", "non contiene modifiche"),
    ],
)
def test_release_rejects_inconsistent_changelog(
    tmp_path, frontend, heading, body, error
):
    write_release_files(tmp_path, frontend=frontend, heading=heading, body=body)

    with pytest.raises(ValueError, match=error):
        validate_release(tmp_path)


def test_release_rejects_missing_version_increment(tmp_path):
    write_release_files(tmp_path)

    with pytest.raises(ValueError, match="non incrementa"):
        validate_release(tmp_path, {"frontend": "1.8.1", "backend": "1.8.1"})


def test_changelog_rejects_future_release():
    with pytest.raises(ValueError, match="data futura"):
        parse_changelog("## [1.8.1] Frontend; Backend - 2999-01-01\n\n- Modifica.")
