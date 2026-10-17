import os
from pathlib import Path
import re

VAULT_DIR = "content"

WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")
MD_LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+\.md(?:#[^)]+)?)\)")

# 📺 Regex to detect YouTube URLs and capture the ID and query parameters
YOUTUBE_URL_RE = re.compile(
    r"(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S*)?"
)


def _match_is_missing(match) -> bool:
    return match is None


def _has_start_time_parameter(url: str) -> bool:
    return bool(re.search(r"[?&](?:t|start)=\d+", url))


def _contains_alias(content: str) -> bool:
    return "|" in content


def _contains_section_marker(target: str) -> bool:
    return "#" in target


def _section_exists(section: str | None) -> bool:
    return section is not None


def _should_skip_youtube_embed(has_start: bool) -> bool:
    return has_start


def _path_does_not_exist(path: Path) -> bool:
    return not path.exists()


def _is_external_url(target: str) -> bool:
    return target.startswith("http")


def _content_has_changed(original: str, updated: str) -> bool:
    return updated != original


def _has_supported_links(text: str) -> bool:
    return any(marker in text for marker in ("[[", ".md)", "youtube.com", "youtu.be"))


def is_markdown_file(filename: str) -> bool:
    return filename.endswith(".md")


def _extract_youtube_info(url: str) -> tuple[str | None, bool]:
    """Extracts the video ID and determines whether the URL contains a start time

    or tracking parameters (like ?t= or &t=) that should prevent it from
    embedding.
    """
    match = YOUTUBE_URL_RE.search(url)
    if _match_is_missing(match):
        return None, False

    video_id = match.group(1)
    has_start_time = _has_start_time_parameter(url)

    return video_id, has_start_time


def _slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"\.md$", "", text)
    text = text.replace(" ", "-")
    text = re.sub(r"[^a-z0-9\-_/]", "", text)
    return text


def _resolve_full_path(current_file: Path, target: str) -> Path:
    """Resolve target to an absolute .md file path."""
    return (current_file.parent / target).with_suffix(".md").resolve()


def _resolve_content_path(current_file: Path, target: str) -> str:
    """Resolve target to a path relative to content/ (without .md)."""
    content_root = Path(VAULT_DIR).resolve()
    resolved = _resolve_full_path(current_file, target)

    rel = resolved.relative_to(content_root)
    return str(rel).replace("\\", "/").removesuffix(".md")


def _parse_target(content: str) -> tuple[str, str | None, str | None]:
    alias = None
    section = None

    if _contains_alias(content):
        target, alias = content.split("|", 1)
    else:
        target = content

    if _contains_section_marker(target):
        target, section = target.split("#", 1)

    return target, alias, section


def _build_ref(page: str, section: str | None) -> str:
    ref = page
    if _section_exists(section):
        ref += f"#{_slugify(section)}"
    return ref


# ==========================================
# 🚀 SEPARATED SHORTCODE / LINK LOGIC
# ==========================================


def _handle_youtube_shortcode(url_or_content: str) -> str | None:
    """Handles YouTube URL checks and returns the shortcode if valid."""
    yt_id, has_start = _extract_youtube_info(url_or_content)
    if yt_id:
        if _should_skip_youtube_embed(has_start):
            return None
        return f"{{{{< youtube {yt_id} >}}}}"
    return None


def _handle_relref_link(
    current_file: Path, target: str, label: Optional[str] = None
) -> str | None:
    """Handles resolving internal paths and building Hugo relref links."""
    if _is_external_url(target):
        return None

    if _contains_section_marker(target):
        path, section = target.split("#", 1)
    else:
        path, section = target, None

    full_path = _resolve_full_path(current_file, path)
    if _path_does_not_exist(full_path):
        return None

    page = _resolve_content_path(current_file, path)
    ref = _build_ref(page, section)
    link_label = label or Path(page).name.replace("-", " ")

    return f"[{link_label}]({{{{< relref \"{ref}\" >}}}})"


# ==========================================
# CONVERSION WRAPPERS
# ==========================================


def _convert_wikilink(match, current_file: Path) -> str:
    content = match.group(1)

    # 1. Try YouTube shortcode logic first
    yt_shortcode = _handle_youtube_shortcode(content)
    if yt_shortcode:
        return yt_shortcode

    # 2. Parse target/alias for standard internal links
    target, alias, section = _parse_target(content)
    full_target = f"{target}#{section}" if section else target

    # 3. Try relref link logic
    relref_link = _handle_relref_link(current_file, full_target, alias)
    if relref_link:
        return relref_link

    return match.group(0)


def _convert_mdlink(match, current_file: Path) -> str:
    text, target = match.groups()

    # 1. Try YouTube shortcode logic
    yt_shortcode = _handle_youtube_shortcode(target)
    if yt_shortcode:
        return yt_shortcode

    # 2. Try relref link logic
    relref_link = _handle_relref_link(current_file, target, text)
    if relref_link:
        return relref_link

    return match.group(0)


def _write_if_changed(path: Path, original: str, updated: str) -> None:
    if _content_has_changed(original, updated):
        path.write_text(updated, encoding="utf-8")
        print(f"Converted: {path}")


def process_file(path: Path) -> None:
    text = path.read_text(encoding="utf-8")

    if not _has_supported_links(text):
        return

    new_text = WIKILINK_RE.sub(lambda m: _convert_wikilink(m, path), text)
    new_text = MD_LINK_RE.sub(lambda m: _convert_mdlink(m, path), new_text)

    _write_if_changed(path, text, new_text)


def main():
    for root, _, files in os.walk(VAULT_DIR):
        for file in files:
            if is_markdown_file(file):
                process_file(Path(root) / file)


if __name__ == "__main__":
    main()
