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
    """
    Resolve a wikilink target to a full filesystem path,
    ensuring it has a `.md` extension.

    Args:
        current_file (Path): Path of the current file containing the wikilink.
        target (str): The target of the wikilink.

    Returns:
        Path: Resolved full path to the target file,
        ensuring it has a `.md` extension.
    """
    target_path = (current_file.parent / target)

    if target_path.suffix != ".md":
        target_path = target_path.with_suffix(".md")

    return target_path.resolve()


def resolve_content_path(current_file: Path, target: str) -> str:
    """ Resolve a wikilink target to a path relative to the content/ directory.

    Args:
        current_file (Path): The path of the current file containing the wikilink.
        target (str): The target of the wikilink.

    Returns:
        str: The resolved path relative to the content/ directory.
    """
    content_root = Path(VAULT_DIR).resolve()

    # Resolve filesystem path
    resolved = (current_file.parent / target).resolve()

    # Convert to path relative to content/
    rel = resolved.relative_to(content_root)

    # Remove .md and normalize separators
    return str(rel).replace("\\", "/").removesuffix(".md")


def convert_wikilink(match, current_file):
    content = match.group(1)

    alias = None
    section = None

    if "|" in content:
        target, alias = content.split("|", 1)
    else:
        target = content

    if "#" in target:
        page, section = target.split("#", 1)
    else:
        page = target
        section = None

    # Check if file exists
    full_path = resolve_full_path(current_file, page)
    if not full_path.exists():
        return match.group(0)  # keep original [[...]]

    # Continue as before
    page = resolve_content_path(current_file, page)

    ref = page
    if section:
        ref += f"#{slugify(section)}"

    label = alias if alias else Path(page).name.replace("-", " ")

    return f"[{label}]({{{{< relref \"{ref}\" >}}}})"


def convert_mdlink(match):
    text = match.group(1)
    target = match.group(2)

    if target.startswith("http"):
        return match.group(0)

    if "#" in target:
        path, section = target.split("#", 1)
    else:
        path = target
        section = None

    path = Path(path).stem
    page = slugify(path)

    ref = page
    if section:
        ref += f"#{slugify(section)}"

    return f"[{text}]({{{{< relref \"{ref}\" >}}}})"


def process_file(path: Path):
    text = path.read_text(encoding="utf-8")

    if "[[" not in text and ".md)" not in text:
        return

    new_text = WIKILINK_RE.sub(lambda m: convert_wikilink(m, path), text)
    new_text = MD_LINK_RE.sub(convert_mdlink, new_text)

    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        print(f"Converted: {path}")


def main():
    for root, dirs, files in os.walk(VAULT_DIR):
        for file in files:
            if file.endswith(".md"):
                process_file(Path(root) / file)


if __name__ == "__main__":
    main()
