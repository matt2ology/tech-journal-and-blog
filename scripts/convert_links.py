import os
import re


def _convert_youtube(content):
    """
    Converts YouTube URLs and iframe embeds to Hugo youtube shortcodes,
    EXCEPT when the link contains start time parameters (e.g., ?t=, &t=, ?start=).
    """
    # Helper check for start time parameters in a URL or string
    def has_start_time(text):
        return bool(re.search(r'[\?&](?:t|start)=\w+', text, re.IGNORECASE))

    # 1. Convert YouTube Markdown links/embeds: [title](url) or ![](url)
    md_url_pattern = r'(!?\[[^\]]*\]\()((?:https?://)?(?:www\.)?(?:youtube\.com/(?:watch\?v=|shorts/)|youtu\.be/)([\w-]+)[^\)]*)(\))'

    def md_url_replacement(match):
        full_url = match.group(2)
        video_id = match.group(3)

        # Skip conversion if link contains timestamp
        if has_start_time(full_url):
            return match.group(0)

        return f'{{{{< youtube {video_id} >}}}}'

    content = re.sub(md_url_pattern, md_url_replacement, content)

    # 2. Convert standard YouTube iframe embed blocks
    iframe_pattern = r'<iframe[^>]*src=["\']([^"\']*(?:youtube\.com/embed/)([\w-]+)[^"\']*)["\'][^>]*></iframe>'

    def iframe_replacement(match):
        full_src = match.group(1)
        video_id = match.group(2)

        # Skip conversion if embed URL contains start time
        if has_start_time(full_src):
            return match.group(0)

        return f'{{{{< youtube {video_id} >}}}}'

    content = re.sub(iframe_pattern, iframe_replacement, content)

    return content


def _convert_wikilinks(content):
    """
    Converts Obsidian style wikilinks to Hugo relref shortcodes.
    """
    pattern = r'\[\[\s*([^\]|#]+)(#[^\]|]+)?\s*(?:\|\s*([^\]]+))?\s*\]\]'

    def replacement(match):
        target = match.group(1).strip()
        anchor = match.group(2) or ''
        alias = match.group(3)

        link_path = f"{target}{anchor}"

        if alias:
            display_text = alias.strip()
        else:
            display_text = os.path.basename(target)

        return f'[{display_text}]({{{{< relref "{link_path}" >}}}})'

    return re.sub(pattern, replacement, content)


def _convert_markdown_links(content):
    """
    Converts standard relative markdown links to Hugo relref shortcodes,
    ignoring external URLs, anchors, and images.
    """
    pattern = r'(?<!\!)\[([^\]]+)\]\(([^)]+)\)'

    def replacement(match):
        text = match.group(1)
        dest = match.group(2).strip()

        # Ignore external links, anchors, or protocol links
        if dest.startswith(('http://', 'https://', 'mailto:', 'ftp://', '#', 'obsidian://')):
            return match.group(0)

        return f'[{text}]({{{{< relref "{dest}" >}}}})'

    return re.sub(pattern, replacement, content)


def _process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Apply conversions
    new_content = _convert_youtube(content)
    new_content = _convert_wikilinks(new_content)
    new_content = _convert_markdown_links(new_content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {file_path}")
    else:
        print(f"No changes needed: {file_path}")


def process_vault(directory):
    if not os.path.exists(directory):
        print(f"Directory not found: {directory}")
        return

    print(f"Scanning directory: {directory}")
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                _process_file(file_path)


if __name__ == '__main__':
    target_directory = './content'
    process_vault(target_directory)
