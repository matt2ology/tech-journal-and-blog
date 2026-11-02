from pathlib import Path
import os
import re
from urllib.parse import quote

VAULT_DIR = "content"

# Matches ![[image.png]] or ![[path/image.png|alt]]
IMAGE_WIKILINK_RE = re.compile(r"!\[\[([^\]]+)\]\]")

# Allowed image extensions
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"}


class ImageWikilinkConverter:
    """Manages the conversion or removal of Obsidian image wikilinks in a markdown file."""

    def __init__(self, file_path: Path):
        """Initialize the converter with a target markdown file path and default attributes."""
        self.file_path = file_path
        self.file_text = ""
        self.frontmatter_section = ""
        self.body_section = ""
        self.current_match = None
        self.image_path = ""
        self.alt_text = None
        self.resolved_path = None
        self.relative_path = ""
        self.new_text = ""

    # Public method
    def convert(self) -> None:
        """Execute the full file conversion process from reading to saving and logging."""
        self._load_file_content()
        self._separate_frontmatter()
        
        if self._has_no_wikilinks():
            return
            
        self._process_body_wikilinks()
        
        if self._has_text_changed():
            self._write_file()
            self._log_conversion_result()

    # Private helper methods
    def _load_file_content(self) -> None:
        """Read text content from the target file into memory using UTF-8 encoding."""
        self.file_text = self.file_path.read_text(encoding="utf-8")

    def _separate_frontmatter(self) -> None:
        """Split raw file text into frontmatter and body attributes."""
        if self._has_frontmatter():
            parts = self.file_text.split("---", 2)
            self.frontmatter_section = "---" + parts[1] + "---"
            self.body_section = parts[2]
        else:
            self.frontmatter_section = ""
            self.body_section = self.file_text

    def _has_frontmatter(self) -> bool:
        """Check whether the file text starts with a valid frontmatter block."""
        return self.file_text.startswith("---") and len(self.file_text.split("---", 2)) >= 3

    def _has_no_wikilinks(self) -> bool:
        """Check if the body section contains any Obsidian wikilink syntax."""
        return "![[ " not in self.body_section and "![[" not in self.body_section

    def _process_body_wikilinks(self) -> None:
        """Replace all image wikilinks in the body section with standard Markdown links or empty strings."""
        updated_body = IMAGE_WIKILINK_RE.sub(
            self._transform_match, self.body_section
        )
        self.new_text = self.frontmatter_section + updated_body

    def _transform_match(self, match) -> str:
        """Transform a single regex wikilink match based on location and validity rules."""
        self.current_match = match
        
        if self._is_not_index_file():
            return ""
            
        if self._is_inside_backticks():
            return self.current_match.group(0)
            
        self._parse_target_content()
        
        if self._has_invalid_extension():
            return ""
            
        if self._is_missing_image_file():
            return ""
            
        self._compute_relative_path()
        
        if self._is_alt_text_missing():
            self._generate_default_alt_text()
            
        return f"![{self.alt_text}]({self.relative_path})"

    def _is_not_index_file(self) -> bool:
        """Check if the target file stem is not named 'index'."""
        return self.file_path.stem != "index"

    def _is_inside_backticks(self) -> bool:
        """Determine if the current match occurs within inline code or code blocks."""
        start_position, _ = self.current_match.span()
        prefix_text = self.body_section[:start_position]
        single_backtick_count = prefix_text.count("`")
        return single_backtick_count % 2 != 0

    def _parse_target_content(self) -> None:
        """Extract image path and optional alt text from the current match content."""
        link_content = self.current_match.group(1)
        if "|" in link_content:
            path_part, alt_part = link_content.split("|", 1)
            self.image_path = path_part.strip()
            self.alt_text = alt_part.strip()
        else:
            self.image_path = link_content.strip()
            self.alt_text = None

    def _has_invalid_extension(self) -> bool:
        """Check if the image target lacks a supported image file extension."""
        file_extension = Path(self.image_path).suffix.lower()
        return file_extension not in IMAGE_EXTENSIONS

    def _is_missing_image_file(self) -> bool:
        """Resolve the image path and check whether the file actually exists on disk."""
        self.resolved_path = (self.file_path.parent / self.image_path).resolve()
        return not self.resolved_path.exists()

    def _compute_relative_path(self) -> None:
        """Compute and URL-encode the relative path from the current file to the image file."""
        raw_relative = os.path.relpath(
            self.resolved_path, start=self.file_path.parent
        ).replace("\\", "/")
        self.relative_path = quote(raw_relative)

    def _is_alt_text_missing(self) -> bool:
        """Check if custom alt text was provided for the image wikilink."""
        return not self.alt_text

    def _generate_default_alt_text(self) -> None:
        """Derive standard alt text from the image filename stem."""
        self.alt_text = Path(self.image_path).stem.replace("-", " ")

    def _has_text_changed(self) -> bool:
        """Check if converted file text differs from the original file text."""
        return self.new_text != self.file_text

    def _write_file(self) -> None:
        """Save updated text content back to the markdown file on disk."""
        self.file_path.write_text(self.new_text, encoding="utf-8")

    def _log_conversion_result(self) -> None:
        """Output conversion or removal details to the console."""
        if self._is_index_file_stem():
            print(f"Converted images in: {self.file_path}")
        else:
            print(f"Removed images in non-index file: {self.file_path}")

    def _is_index_file_stem(self) -> bool:
        """Check if the current file stem is exactly 'index'."""
        return self.file_path.stem == "index"


def process_file(file_path: Path) -> None:
    """Instantiate and run the image wikilink converter for a given file path."""
    converter = ImageWikilinkConverter(file_path)
    converter.convert()


def main() -> None:
    """
    Scans all markdown files in the vault. 
    - In index.md files, converts valid Obsidian image wikilinks for Hugo.
    - In all other markdown files, removes image wikilinks entirely.
    """
    for markdown_path in Path(VAULT_DIR).rglob("*.md"):
        process_file(markdown_path)


if __name__ == "__main__":
    main()
