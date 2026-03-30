import re
import os
from pathlib import Path

VAULT_DIR = "content"

WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")
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

    Args:
        content: The inner content of a wikilink (e.g., "folder/page#section|alias").

    Returns:
        A tuple of (target, alias, section):
            - target (str): The page path (e.g., "folder/page").
            - alias (str | None): The display label, if provided.
            - section (str | None): The section name, if provided.

    Examples:
        "[[folder/page]]"
            -> ("folder/page", None, None)

        "[[folder/page|Custom Label]]"
            -> ("folder/page", "Custom Label", None)

        "[[folder/page#Section Name]]"
            -> ("folder/page", None, "Section Name")

        "[[folder/page#Section Name|Custom Label]]"
            -> ("folder/page", "Custom Label", "Section Name")
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


def convert_wikilink(match, current_file: Path) -> str:
    """
    Convert a wikilink match into a Hugo relref-style Markdown link.

    The function parses a wikilink of the form:
        [[target#section|alias]]

    It finds the target file based on the current file, checks if it exists,
    and converts the link to a Hugo relref. If the file doesn't exist,
    it leaves the link as is.

    Args:
        match: A regex match object containing the wikilink content.
        current_file: The path to the file where the link was found.

    Returns:
        A Markdown link string using Hugo relref syntax, or the original match
        string if the target cannot be resolved.

    Notes:
        - If an alias is provided, it is used as the link label.
        - Otherwise, the label is derived from the target filename with hyphens
          replaced by spaces.
        - Section anchors are preserved in the generated reference.
    """
    content = match.group(1)
    target, alias, section = parse_target(content)

    full_path = resolve_full_path(current_file, target)

    # 🚫 Do not convert if file does not exist
    if not full_path.exists():
        return match.group(0)

    page = resolve_content_path(current_file, target)
    ref = build_ref(page, section)

    label = alias or Path(page).name.replace("-", " ")

    return f"[{label}]({{{{< relref \"{ref}\" >}}}})"


def convert_mdlink(match, current_file: Path) -> str:
    """
    Convert a standard Markdown link into a Hugo relref-style link.

    The function processes links of the form:
        [text](target#section)

    It skips external links (e.g., starting with "http"), resolves the target
    path relative to the current file, and converts valid internal links into
    Hugo relref format. If the target file does not exist, the original match
    is returned unchanged.

    Args:
        match: A regex match object containing the link text and target.
        current_file: The path to the file where the link was found.

    Returns:
        A Markdown link string using Hugo relref syntax, or the original match
        string if the link is external or cannot be resolved.

    Notes:
        - External links (starting with "http") are not modified.
        - Section anchors (after '#') are preserved in the generated reference.
    """
    text, target = match.groups()

    # 🚫 Skip external links
    if target.startswith("http"):
        return match.group(0)

    if "#" in target:
        path, section = target.split("#", 1)
    else:
        path, section = target, None

    full_path = resolve_full_path(current_file, path)

    # 🚫 Do not convert if file does not exist
    if not full_path.exists():
        return match.group(0)

    page = resolve_content_path(current_file, path)
    ref = build_ref(page, section)

    return f"[{text}]({{{{< relref \"{ref}\" >}}}})"


def process_file(path: Path) -> None:
    text = path.read_text(encoding="utf-8")

    if "[[" not in text and ".md)" not in text:
        return

    new_text = WIKILINK_RE.sub(lambda m: convert_wikilink(m, path), text)
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
