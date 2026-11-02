from pathlib import Path
import os
import re

VAULT_DIR = "content"

# Matches ==highlighted text==
HIGHLIGHT_RE = re.compile(r"==([^=]+)==")


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


def is_inside_backticks(text: str, start_pos: int) -> bool:
    """
    Check if a position is inside inline code (`...`) or code block (```...```).
    """
    before = text[:start_pos]
    single_backticks = before.count("`")
    return single_backticks % 2 != 0  # odd number => inside backticks


def convert_highlight(match, text: str) -> str:
    start, end = match.span()

    # Skip if inside backticks
    if is_inside_backticks(text, start):
        return match.group(0)

    content = match.group(1).strip()
    if not content:
        return match.group(0)

    return f"<mark>{content}</mark>"


def process_file(path: Path):
    text = path.read_text(encoding="utf-8")

    frontmatter, body = split_frontmatter(text)

    if "==" not in body:
        return

    new_body = HIGHLIGHT_RE.sub(
        lambda m: convert_highlight(m, body), body
    )

    new_text = frontmatter + new_body

    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        print(f"Converted highlights in: {path}")


def main():
    """
    Convert Obsidian highlights (==text==) to Hugo HTML (<mark>text</mark>)
    across all markdown files in the content directory.
    """
    for path in Path(VAULT_DIR).rglob("*.md"):
        process_file(path)


if __name__ == "__main__":
    main()