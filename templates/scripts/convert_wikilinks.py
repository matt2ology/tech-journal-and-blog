import re
import os
from pathlib import Path

VAULT_DIR = "content"   # change to your vault root if needed

# Regex to match [[...]]
WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")


def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"\.md$", "", text)
    text = text.replace(" ", "-")
    text = re.sub(r"[^a-z0-9\-_/]", "", text)
    return text


def convert_link(match):
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

    page = slugify(page)

    ref = page
    if section:
        ref += f"#{slugify(section)}"

    if alias:
        return f"[{alias}]({{{{< relref \"{ref}\" >}}}})"
    else:
        label = page.split("/")[-1].replace("-", " ")
        return f"[{label}]({{{{< relref \"{ref}\" >}}}})"


def process_file(path: Path):
    text = path.read_text(encoding="utf-8")

    if "[[" not in text:
        return

    new_text = WIKILINK_RE.sub(convert_link, text)

    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        print("Converted:", path)


def main():
    for root, dirs, files in os.walk(VAULT_DIR):
        for file in files:
            if file.endswith(".md"):
                process_file(Path(root) / file)


if __name__ == "__main__":
    main()
