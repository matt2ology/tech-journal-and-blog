# Obsidian Export

Return to the Obsidian app to initiate a sync. If you take new highlights on documents you've already exported at least once, those new highlights will be appended to the end of the existing files.

## File name

```python
{% macro slug(s, length) -%} {{ s | lower | replace('#','-') | replace('*','-') | replace(':','-') | replace("and","") | replace(' ','-') | replace(' - ','-') | replace(' -','-') | replace('- ','-') | replace('..','') | replace('.','-') | replace('"','') | replace("'","") | replace('…','-') | replace('(','') | replace(')','') | replace(',','') | replace('|','') | replace('/','') | replace('--','-') | truncate(length, True, '') | replace('--','-') | replace('^-','') | replace('-$','') }} {%- endmacro %}  mgn-{{ slug(author, 50) }}-{{ slug(title, 50) }}
```

## Page title

```python
## {{ full_title }}
```

## Page metadata

```python
{% if image_url -%}
![rw-book-cover]({{image_url}})
{% endif -%}

{% if url -%}
**Source link:** [{{full_title}}]({{url}})
{% else %}
source: {{source}}
{% endif -%}
```

## Highlights header

Header text above each set of synced highlights. Leave blank to omit header.

```python
{% if is_new_page %}
## Highlights
{% elif has_new_highlights -%}
## New highlights added {{date|date('F j, Y')}}
{% endif -%}
```

## Highlight

The formatting of each individual highlight.

1. `replace('*', '')`
  - Removes all asterisk characters (*) from the string.
2. `regex_replace('[^\w\s-]', '')`
  - Strips out all punctuation and special characters. It keeps only word characters (\w: letters, digits, and underscores), whitespace (\s), and hyphens (-).
3. `regex_replace('[\s_]+', '-')`
  - Replaces any sequence of spaces or underscores ([\s_]+) with a single hyphen (-).
4. `regex_replace('-+', '-')`
  - Collapses multiple consecutive hyphens (-+) down into a single hyphen (-).
5. `regex_replace('^-+|-+$', '')`
  - Trims any leftover hyphens from the very beginning (^+) or very end (+$) of the string.

```python

{% if highlight_note -%}
**Marginalia / Reflection:**
{{ highlight_note }}{%- endif %}
{% if highlight_tags %}
Tags: {% for tag in highlight_tags %}[[{{tag}}]]{% endfor %}
{% endif %}
{% if highlight_text -%}
> [!quote] Key Definition / Axiom
> "{{ highlight_text }}"
> \- _{% if author %}{{ author }}. {% endif %}{% if title %}{{ title }}{% endif %}{% if highlight_location_url and highlight_location %} ([{{ highlight_location }}]({{ highlight_location_url }})){% elif highlight_location %} ({{ highlight_location }}){% endif %}{% if source %}. {{ source }}{% endif %}_
{%- endif %}
```

## YAML front matter

Don't include the triple dashes. Leave blank to disable YAML front matter altogether.

```python
{% macro slugify_and_fixup(s) -%}
{{ s
  | lower
  | replace('*', '')
  | regex_replace('[^\w\s-]', '')
  | regex_replace('[\s_]+', '-')
  | regex_replace('-+', '-')
  | regex_replace('^-+|-+$', '')
}}
{%- endmacro %}
{% macro fixup(s) -%}
{{ s
| replace('*','')
| replace('--','-')
| replace('^-','')
| replace('-$','')
}}
{%- endmacro %}

title: "Marginal Notes on {{author}} - {{fixup(title)}}"
date: {{date|date("Y-m-d")}}
draft: true
slug: "mgn-{{slugify_and_fixup(title)}}"
categories:
  - marginalia
  - {{category}}
  - {{source}}
tags: {% for tag in document_tags %}
  - {{tag}} {% endfor %}
authors: [[{{slugify_and_fixup(author)}}|{{author}}]]
book: {{ full_title }}
```

## Sync notification

Special file containing sync notification entries. Leave blank to disable notification altogether.

```python

```
