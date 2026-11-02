from pathlib import Path
import pytest
from scripts.convert_highlights import (
    split_frontmatter,
    is_inside_backticks,
    convert_highlight,
    process_file,
    HIGHLIGHT_RE,
)


def test_split_frontmatter_with_frontmatter():
    text = "---\ntitle: Hello\n---\nThis is the body with ==highlight==."
    frontmatter, body = split_frontmatter(text)
    assert frontmatter == "---\ntitle: Hello\n---"
    assert body == "\nThis is the body with ==highlight==."


def test_split_frontmatter_without_frontmatter():
    text = "This is just body text with ==highlight==."
    frontmatter, body = split_frontmatter(text)
    assert frontmatter == ""
    assert body == "This is just body text with ==highlight==."


def test_is_inside_backticks():
    text = "Some `code ==not highlighted==` and normal ==highlight=="

    # Test highlight inside backticks
    match1 = HIGHLIGHT_RE.search(text)
    assert is_inside_backticks(text, match1.start()) is True

    # Test highlight outside backticks
    match2 = HIGHLIGHT_RE.search(text, match1.end())
    assert is_inside_backticks(text, match2.start()) is False


def test_convert_highlight_valid():
    text = "This is ==important== text."
    match = HIGHLIGHT_RE.search(text)
    res = convert_highlight(match, text)
    assert res == "<mark>important</mark>"


def test_convert_highlight_empty():
    text = "This is ==   == empty."
    match = HIGHLIGHT_RE.search(text)
    res = convert_highlight(match, text)
    assert res == "==   =="


def test_process_file(tmp_path: Path):
    # Create a temporary markdown file mimicking a vault file
    p = tmp_path / "test_post.md"
    content = """---
title: Test Post
---
Here is some ==highlighted text== and some `code ==with highlight==` inside.
"""
    p.write_text(content, encoding="utf-8")

    # Run process_file on the temp file
    process_file(p)

    updated_content = p.read_text(encoding="utf-8")
    expected = """---
title: Test Post
---
Here is some <mark>highlighted text</mark> and some `code ==with highlight==` inside.
"""
    assert updated_content == expected
