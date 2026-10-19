import os
import re
from pathlib import Path

VAULT_DIR = "content"

# Captures Obsidian wikilinks anywhere in a line (e.g., [[path|alias#section]])
WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")

# Captures standard relative markdown links (.md) anywhere within a line (e.g., in task lists or paragraphs)
MD_LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+\.md(?:#[^)]+)?)\)")


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
    Parse a wikilink string into its target, alias, and section components.
    """
    alias = None
    section = None

    if "|" in content:
        target, alias = content.split("|", 1)
    else:
        target = content

    if "#" in target:
        target, section = target.split("#", 1)

    return target, alias, section


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
    md_url_pattern = r'(!?\[[^\]]*\]\()((?:https?://)?(?:www\.)?(?:youtube\.com/(?:watch\?v=|shorts/)|youtu\.be/)([\w-]+)[^\)]*)(\))'

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
    Convert an Obsidian-style wikilink match into a Hugo relref-style Markdown link,
    whether it appears in a paragraph, list, or checkbox line.
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
    Convert a standard Markdown link into a Hugo relref-style link,
    whether it appears in a paragraph, list, or checkbox line.
    """
    text, target = match.groups()

    # Skip external links
    if target.startswith("http"):
        return match.group(0)

    if "#" in target:
        path, section = target.split("#", 1)
    else:
        path, section = target, None

    full_path = resolve_full_path(current_file, path)

    # Do not convert if file does not exist
    if not full_path.exists():
        return match.group(0)

    page = resolve_content_path(current_file, path)
    ref = build_ref(page, section)

    return f'[{text}]({{{{< relref "{ref}" >}}}})'


def process_file(path: Path) -> None:
    text = path.read_text(encoding="utf-8")

    # Apply all conversion routines
    new_text = convert_youtube(text)

    if "[[" in new_text or ".md" in new_text:
        new_text = WIKILINK_RE.sub(
            lambda m: convert_wikilink(m, path), new_text)
        new_text = MD_LINK_RE.sub(lambda m: convert_mdlink(m, path), new_text)

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
