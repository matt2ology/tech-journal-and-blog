import re
from pathlib import Path

VAULT_DIR = "content"

# Matches ![[image.png]] or ![[path/image.png|alt]]
IMAGE_WIKILINK_RE = re.compile(r"!\[\[([^\]]+)\]\]")

# Allowed image extensions
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"}


def parse_image_target(content: str):
    """Extract path and optional alt text from Obsidian image wikilink."""
    if "|" in content:
        path, alt = content.split("|", 1)
    else:
        path, alt = content, None

    return path.strip(), alt.strip() if alt else None


def convert_image_wikilink(match, current_file: Path):
    content = match.group(1)
    path, alt = parse_image_target(content)

    # Only process if file has a valid image extension
    if Path(path).suffix.lower() not in IMAGE_EXTENSIONS:
        return ""  # remove non-image links entirely

    # Resolve relative path
    full_path = (current_file.parent / path).resolve()

    # Skip missing images entirely
    if not full_path.exists():
        return ""  # remove missing images

    # Convert to relative path from current file
    rel_path = full_path.relative_to(current_file.parent)
    rel_path = str(rel_path).replace("\\", "/")

    # Use filename as alt if not provided
    if not alt:
        alt = Path(path).stem.replace("-", " ")

    return f"![{alt}]({rel_path})"


def process_file(path: Path):
    text = path.read_text(encoding="utf-8")

    if "![[ " not in text and "![[" not in text:
        return

    new_text = IMAGE_WIKILINK_RE.sub(
        lambda m: convert_image_wikilink(m, path), text
    )

    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        print(f"Converted images in: {path}")


def main():
    """
    Convert Obsidian image wikilinks in all index.md files to standard Markdown,
    only for real image files. Missing images are removed entirely.
    """
    for path in Path(VAULT_DIR).rglob("index.md"):
        process_file(path)


if __name__ == "__main__":
    main()
