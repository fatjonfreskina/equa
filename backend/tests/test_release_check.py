from datetime import date
from pathlib import Path

import pytest

from scripts.check_release import (
    affected_components,
    incremented_components,
    parse_changelog,
    validate_release,
)


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

    assert validate_release(
        tmp_path,
        {"frontend": "1.8.0", "backend": "1.8.0"},
        {"frontend"},
    ) == {
        "frontend": "1.8.1",
        "backend": "1.8.0",
    }


def test_release_rejects_affected_component_without_increment(tmp_path):
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

    with pytest.raises(ValueError, match="backend"):
        validate_release(
            tmp_path,
            {"frontend": "1.8.0", "backend": "1.8.0"},
            {"frontend", "backend"},
        )


def test_component_changes_and_version_increments_are_reported_independently():
    assert affected_components(
        ["frontend/src/App.vue", "doc/CHANGELOG.md", "backend/app/main.py"]
    ) == {"frontend", "backend"}
    assert incremented_components(
        {"frontend": "1.8.2", "backend": "1.8.1"},
        {"frontend": "1.8.1", "backend": "1.8.1"},
    ) == {"frontend"}


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


def test_release_rejects_empty_entry_for_second_incremented_component(tmp_path):
    write_release_files(
        tmp_path,
        heading="## [1.8.1] Frontend",
        body=(
            "### Corretto\n\n- Frontend documentato.\n\n"
            f"## [1.8.1] Backend - {date.today()}\n"
        ),
    )

    with pytest.raises(ValueError, match="backend.*non contiene modifiche"):
        validate_release(
            tmp_path,
            {"frontend": "1.8.0", "backend": "1.8.0"},
            {"frontend", "backend"},
        )


def test_release_rejects_missing_version_increment(tmp_path):
    write_release_files(tmp_path)

    with pytest.raises(ValueError, match="non incrementa"):
        validate_release(tmp_path, {"frontend": "1.8.1", "backend": "1.8.1"})


def test_changelog_rejects_future_release():
    with pytest.raises(ValueError, match="data futura"):
        parse_changelog("## [1.8.1] Frontend; Backend - 2999-01-01\n\n- Modifica.")
