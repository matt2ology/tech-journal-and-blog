import os
import re
from pathlib import Path

VAULT_DIR = "content"

# Captures Obsidian wikilinks anywhere in a line: [[target#section|alias]]
WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")

# Captures standard relative markdown links (.md) anywhere in a line, supporting anchors: [text](target.md#section)
MD_LINK_RE = re.compile(r"\[([^\]]+)\]\((([^)]+\.md)(?:#[^)]+)?)\)")


def split_frontmatter(text: str) -> tuple[str, str]:
    """
    Splits markdown content into frontmatter and body.
    If frontmatter exists (starts with '---'), returns (frontmatter, body).
    Otherwise, returns ('', text).
    """
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            frontmatter = "---" + parts[1] + "---"
            body = parts[2]
            return frontmatter, body
    return "", text


def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"\.md$", "", text)
    text = text.replace(" ", "-")
    text = re.sub(r"[^a-z0-9\-_/]", "", text)
    return text


def resolve_full_path(current_file: Path, target: str) -> Path:
    """Resolve target to an absolute .md file path."""
    return (current_file.parent / target).with_suffix(".md").resolve()


def resolve_content_path(current_file: Path, target: str) -> str:
    """Resolve target to a path relative to content/ (without .md)."""
    content_root = Path(VAULT_DIR).resolve()
    resolved = resolve_full_path(current_file, target)

    rel = resolved.relative_to(content_root)
    return str(rel).replace("\\", "/").removesuffix(".md")


def parse_target(content: str) -> tuple[str, str | None, str | None]:
    """
    Parse a link string into its target, alias, and section components.
    Handles:
        - target
        - target#section
        - target|alias
        - target#section|alias
    """
    alias = None
    section = None

    if "|" in content:
        content, alias = content.split("|", 1)

    if "#" in content:
        content, section = content.split("#", 1)

    return content.strip(), alias.strip() if alias else None, section.strip() if section else None


def build_ref(page: str, section: str | None) -> str:
    """Build Hugo relref string.
        - For page: "folder/page"
        - For section: "folder/page#section"
        - Slugify section for URL compatibility
    """
    ref = page
    if section:
        ref += f"#{slugify(section)}"
    return ref


def convert_youtube(content: str) -> str:
    """
    Converts YouTube URLs and iframe embeds to Hugo youtube shortcodes.
    Skips conversion if the link contains start time parameters (t= or start=).
    Always quotes the video ID argument.
    """
    def has_start_time(text):
        return bool(re.search(r'[\?&](?:t|start)=\w+', text, re.IGNORECASE))

    # Convert YouTube Markdown links/embeds: [title](url) or ![](url)
    md_url_pattern = r'(!?\[[^\]]*\]\()((?:https?://)?(?:www\.)?(?:youtube\.com/(?:watch\?v=\vert{}shorts/)\vert{}youtu\.be/)([\w-]+)[^\)]*)(\))'

    def md_url_replacement(match):
        full_url = match.group(2)
        video_id = match.group(3)

        if has_start_time(full_url):
            return match.group(0)

        return f'{{{{< youtube "{video_id}" >}}}}'

    content = re.sub(md_url_pattern, md_url_replacement, content)

    return content


def convert_wikilink(match, current_file: Path) -> str:
    """
    Convert an Obsidian-style wikilink match into a Hugo
    relref-style Markdown link. Supports:
    - Targets
    - Header sections (`#`)
    - and custom aliases (`|`).
    """
    content = match.group(1)
    target, alias, section = parse_target(content)

    full_path = resolve_full_path(current_file, target)

    # Do not convert if file does not exist
    if not full_path.exists():
        return match.group(0)

    page = resolve_content_path(current_file, target)
    ref = build_ref(page, section)

    label = alias or Path(page).name.replace("-", " ")

    return f'[{label}]({{{{< relref "{ref}" >}}}})'


def convert_mdlink(match, current_file: Path) -> str:
    """
    Convert a standard Markdown link into a Hugo relref-style link.
    Supports relative .md paths, header sections (#), and explicit text labels (aliases).
    """
    text, full_target = match.groups()

    # Skip external links
    if full_target.startswith(
        ("http://", "https://", "mailto:", "ftp://", "obsidian://")
    ):
        return match.group(0)

    # Separate path from anchor section if present (e.g., page.md#my-header)
    if "#" in full_target:
        path, section = full_target.split("#", 1)
    else:
        path, section = full_target, None

    full_path = resolve_full_path(current_file, path)

    # Do not convert if file does not exist
    if not full_path.exists():
        return match.group(0)

    page = resolve_content_path(current_file, path)
    ref = build_ref(page, section)

    return f'[{text}]({{{{< relref "{ref}" >}}}})'


def process_file(path: Path) -> None:
    text = path.read_text(encoding="utf-8")

    # Separate frontmatter from body
    frontmatter, body = split_frontmatter(text)

    # Apply all conversion routines to the body only
    new_body = convert_youtube(body)

    # Only run regex if potential links are present in the body
    if "[[" in new_body or ".md" in new_body:
        new_body = WIKILINK_RE.sub(
            lambda m: convert_wikilink(m, path), new_body)
        new_body = MD_LINK_RE.sub(lambda m: convert_mdlink(m, path), new_body)

    new_text = frontmatter + new_body

    # Only write if changes were made
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        print(f"Converted: {path}")


def main():
    for root, _, files in os.walk(VAULT_DIR):
        for file in files:
            if file.endswith(".md"):
                process_file(Path(root) / file)


if __name__ == "__main__":
    main()
