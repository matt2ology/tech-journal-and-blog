from pathlib import Path
import re

VAULT_DIR = "content"
HIGHLIGHT_RE = re.compile(r"==([^=]+)==")


def split_frontmatter(text: str) -> tuple[str, str]:
    """Splits markdown content into frontmatter and body."""
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            return f"---{parts[1]}---", parts[2]
    return "", text


def is_inside_backticks(text: str, start_pos: int) -> bool:
    """Check if a position is inside inline code or a code block."""
    return text[:start_pos].count("`") % 2 != 0


def convert_highlight(match: re.Match, text: str) -> str:
    """Convert valid highlights to <mark> tags."""
    start, _ = match.span()

    if is_inside_backticks(text, start):
        return match.group(0)

    content = match.group(1).strip()
    if not content:
        return match.group(0)

    return f"<mark>{content}</mark>"


def process_file(path: Path) -> None:
    """Process a single markdown file to convert Obsidian highlights."""
    text = path.read_text(encoding="utf-8")
    frontmatter, body = split_frontmatter(text)

    if "==" not in body:
        return

    new_body = HIGHLIGHT_RE.sub(lambda m: convert_highlight(m, body), body)
    new_text = frontmatter + new_body

    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        print(f"Converted highlights in: {path}")


def main() -> None:
    """Convert Obsidian highlights to Hugo HTML across markdown files[cite: 1]."""
    for path in Path(VAULT_DIR).rglob("*.md"):
        process_file(path)


if __name__ == "__main__":
    main()
