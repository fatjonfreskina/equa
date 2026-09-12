#!/usr/bin/env python3
"""Validate Equa release metadata before merging into main."""

from __future__ import annotations

import argparse
import re
import subprocess
from dataclasses import dataclass
from datetime import date
from pathlib import Path


VERSION_FILES = {
    "frontend": (
        Path("frontend/src/config.ts"),
        re.compile(r"APP_VERSION\s*=\s*['\"](?P<version>\d+\.\d+\.\d+)['\"]"),
    ),
    "backend": (
        Path("backend/app/main.py"),
        re.compile(r'FastAPI\(title="Equa API", version="(?P<version>\d+\.\d+\.\d+)"\)'),
    ),
}
COMPONENT_PATHS = {
    "frontend": "frontend/",
    "backend": "backend/",
}
HEADING_RE = re.compile(
    r"^## \[(?P<version>\d+\.\d+\.\d+)\] "
    r"(?P<scopes>Frontend|Backend|Frontend; Backend|Backend; Frontend) - "
    r"(?P<date>\d{4}-\d{2}-\d{2})$",
    re.MULTILINE,
)


@dataclass(frozen=True)
class ReleaseEntry:
    version: str
    scopes: frozenset[str]
    release_date: date
    body: str


def semantic_version(value: str) -> tuple[int, int, int]:
    return tuple(int(part) for part in value.split("."))  # type: ignore[return-value]


def versions_from_contents(contents: dict[str, str]) -> dict[str, str]:
    versions = {}
    for component, (_, pattern) in VERSION_FILES.items():
        match = pattern.search(contents[component])
        if not match:
            raise ValueError(f"Versione {component} non trovata")
        versions[component] = match.group("version")
    return versions


def read_versions(root: Path) -> dict[str, str]:
    return versions_from_contents(
        {
            component: (root / path).read_text(encoding="utf-8")
            for component, (path, _) in VERSION_FILES.items()
        }
    )


def incremented_components(
    versions: dict[str, str], base_versions: dict[str, str]
) -> set[str]:
    return {
        component
        for component, version in versions.items()
        if semantic_version(version) > semantic_version(base_versions[component])
    }


def affected_components(paths: list[str]) -> set[str]:
    return {
        component
        for component, prefix in COMPONENT_PATHS.items()
        if any(path.startswith(prefix) for path in paths)
    }


def parse_changelog(text: str) -> list[ReleaseEntry]:
    matches = list(HEADING_RE.finditer(text))
    if not matches:
        raise ValueError("Nessuna release valida trovata in doc/CHANGELOG.md")

    entries = []
    for index, match in enumerate(matches):
        release_date = date.fromisoformat(match.group("date"))
        if release_date > date.today():
            raise ValueError(f"La release {match.group('version')} ha una data futura")
        body_end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        entries.append(
            ReleaseEntry(
                version=match.group("version"),
                scopes=frozenset(
                    scope.strip().lower() for scope in match.group("scopes").split(";")
                ),
                release_date=release_date,
                body=text[match.end() : body_end],
            )
        )
    return entries


def validate_release(
    root: Path,
    base_versions: dict[str, str] | None = None,
    affected: set[str] | None = None,
) -> dict[str, str]:
    versions = read_versions(root)
    entries = parse_changelog((root / "doc/CHANGELOG.md").read_text(encoding="utf-8"))

    if not re.search(r"^\s*-\s+\S", entries[0].body, re.MULTILINE):
        raise ValueError("La release più recente del changelog non contiene modifiche")

    for component, version in versions.items():
        declaration = next(
            (entry for entry in entries if component in entry.scopes), None
        )
        if not declaration or declaration.version != version:
            declared = declaration.version if declaration else "nessuna"
            raise ValueError(
                f"Versione {component} {version}, ultima versione nel changelog {declared}"
            )

    if base_versions is not None:
        for component, version in versions.items():
            current = semantic_version(version)
            base = semantic_version(base_versions[component])
            if current < base:
                raise ValueError(
                    f"La versione {component} regredisce da {base_versions[component]} a {version}"
                )
        changed = incremented_components(versions, base_versions)
        if not changed:
            raise ValueError("La PR di release non incrementa alcuna versione")
        missing = (affected or set()) - changed
        if missing:
            raise ValueError(
                "Componenti modificati senza incremento di versione: "
                + ", ".join(sorted(missing))
            )

    return versions


def versions_at_ref(root: Path, ref: str) -> dict[str, str]:
    contents = {}
    for component, (path, _) in VERSION_FILES.items():
        result = subprocess.run(
            ["git", "show", f"{ref}:{path.as_posix()}"],
            cwd=root,
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        contents[component] = result.stdout
    return versions_from_contents(contents)


def paths_changed_since(root: Path, ref: str) -> list[str]:
    result = subprocess.run(
        ["git", "diff", "--name-only", ref, "HEAD", "--"],
        cwd=root,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return [path for path in result.stdout.splitlines() if path]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-ref")
    parser.add_argument("--github-output", type=Path)
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    base_versions = versions_at_ref(root, args.base_ref) if args.base_ref else None
    affected = (
        affected_components(paths_changed_since(root, args.base_ref))
        if args.base_ref
        else None
    )
    versions = validate_release(root, base_versions, affected)
    changed = (
        incremented_components(versions, base_versions)
        if base_versions
        else set(versions)
    )

    if args.github_output:
        with args.github_output.open("a", encoding="utf-8") as output:
            for component, version in versions.items():
                output.write(f"{component}_version={version}\n")
                output.write(
                    f"{component}_changed={'true' if component in changed else 'false'}\n"
                )

    print(
        "Release valida: "
        + ", ".join(f"{component} {version}" for component, version in versions.items())
    )


if __name__ == "__main__":
    main()
