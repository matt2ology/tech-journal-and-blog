---
authors:
  - matt2ology
categories:
  - blog
date: 2025-10-05T01:50:28-07:00
draft: false
tags:
  - readwise
  - obsidian
  - note-taking
  - digital-notes
  - knowledge-management
title: Blog - Configuring Readwise Exports for Obsidian
---

## Automating Your Readwise Exports into Obsidian: A Deep Dive into My Configuration

If you’re like me, a user of both Readwise and Obsidian, you know how valuable it is to seamlessly integrate your highlights and notes from Readwise into Obsidian for long-term knowledge management. To make this process efficient and automated, I’ve built a custom export template that formats my Readwise data perfectly for Obsidian vaults.

I want to share the core parts of my configuration that handle file naming, metadata formatting, highlight organization, and front matter YAML - all designed to maximize readability and usability within Obsidian.

### File Naming Convention

First things first, the filename. A consistent naming scheme is key for organizing hundreds of highlights. My format looks like this:

```
rwd-{{author|lower|replace("and","")|replace(" ","-")|replace("...","")|truncate(20)}}-{{title|lower|replace(""","")|replace(""","")|replace("'","")|replace("'","")|replace("/","-")|replace(" ","-")|replace(" ","-")|replace("...","")|truncate(30)}}
```

Breaking it down:

- Starts with `rwd-` to denote "Readwise Data"
- Author name is sanitized: lowercase, removing "and", replacing spaces with dashes, removing ellipses, truncated to 20 characters
- Book or article title is also cleaned and truncated (30 characters max)

This ensures filenames remain readable, unique, and manageable, avoiding problematic characters like quotes or slashes.

### Page Title

For each exported highlight page, the title is formatted as:

```
## {{ full_title }} (Highlights)
```

This clear header allows me to immediately identify the source material and that the page contains highlights, improving navigation inside Obsidian.

### Metadata Block

Metadata is essential to provide context without cluttering the note. My export includes:

```markdown
{% if image_url -%}

![rw-book-cover]({{image_url}})

Source published date: {{published_date}}

{% endif -%}
{% if url -%}
**Link:** [{{full_title}}]({{url}})
{% else %}
source: {{source}}
{% endif -%}
```

If available, the book or article cover image is included, alongside publication date. I also embed the source link when present, or fallback to a source name. This enriches the note and helps later retrieval or citation.

### Highlight Section Headers

To organize highlights clearly, I dynamically include:

```markdown
{% if is_new_page %}
## Highlights
{% elif has_new_highlights -%}
## New highlights added {{date|date('F j, Y')}} at {{time}}
{% endif -%}
```

This means on a fresh export, the section is simply titled "Highlights," but on updates, I can track when new highlights were added - great for incremental review and daily workflows.

### Formatting Individual Highlights

Each highlight is formatted with location info or ID:

```markdown
{% if highlight_location == "View Highlight" %}### id{{ highlight_id }}{% elif highlight_location == "View Tweet" %}### id{{ highlight_id }}{% else %}### {{highlight_location}}{% endif %}

> {{ highlight_text }}{% if highlight_location and highlight_location_url %}
> \- [({{ highlight_location }})]({{ highlight_location_url }})
{% elif highlight_location %}
({{ highlight_location }})
{% else %}
<!-- Adding a blank line -->
{% endif %}{% if highlight_note %}
**Initial thought or note on:** {% if highlight_location and highlight_location_url %}[({{highlight_location}})]({{highlight_location_url}}){% elif highlight_location %}({{highlight_location}}){% endif %}
{{ highlight_note }}
{% endif %}
```

This includes:

- Highlight location or an ID if location is generic
- The highlight text itself in blockquote format for readability
- Optional links to the highlight’s exact location or tweet
- Any personal notes attached, labeled as “Initial thought or note on”

This structured formatting makes it easy to visually parse each highlight and reflect on it within Obsidian.

### YAML Front Matter

Finally, each file begins with comprehensive YAML front matter metadata:

```yaml
authors: {{author}}
categories:
  - reference
date: {{date|date("Y-m-d")}}
draft: true
media: {{category}}
source: {{source}}
tags: readwise, reference/{{category}}{% for tag in document_tags %}, {{tag}}{% endfor %}
title: Reference - {{author}} - {{title}}
```

This front matter enables:

- Author and source tracking
- Categorization and tagging for Obsidian plugins or queries
- Draft status for workflow management
- Standardized titles for note previews

## Why This Setup Works for Me

By automating these formatting rules, I can quickly import and review Readwise highlights in a clean, consistent way inside Obsidian. It supports my knowledge workflow by making highlights searchable, linkable, and context-rich.

If you’re looking to build a similar export template or workflow, feel free to use this as a base. It’s a blend of practical file naming, markdown structuring, and metadata management that turns your reading highlights into a powerful personal knowledge base.
