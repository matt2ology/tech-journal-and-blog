# Obsidian Export

Return to the Obsidian app to initiate a sync. If you take new highlights on documents you've already exported at least once, those new highlights will be appended to the end of the existing files.

## File name

```python
{% macro slug(s, length) -%} {{ s | lower | replace('#','-') | replace('*','-') | replace(':','-') | replace("and","") | replace(' ','-') | replace(' - ','-') | replace(' -','-') | replace('- ','-') | replace('..','') | replace('.','-') | replace('"','') | replace("'","") | replace('…','-') | replace('(','') | replace(')','') | replace(',','') | replace('|','') | replace('/','') | replace('--','-') | truncate(length, True, '') | replace('--','-') | replace('^-','') | replace('-$','') }} {%- endmacro %}  mgn-{{ slug(author, 50) }}-{{ slug(title, 50) }}
```

## Page title

```python
## {{author}} - {{ full_title| replace('#', '\#') }}
```

## Page metadata

```python
**Source published date:** {{published_date}}
{% if url %}
**Source link:** [{{full_title}}]({{url}})
{% else %}
**source:** {{source}}
{% endif -%}
```

## Highlights header

Header text above each set of synced highlights. Leave blank to omit header.

```python
{% if is_new_page %}
## Highlights & Marginalia
{% elif has_new_highlights -%}
## New highlights added {{date|date('F j, Y')}}
{% endif -%}
```

## Highlight

The formatting of each individual highlight.

```python

### id{{ highlight_id }}

{% if highlight_note -%}
**Marginalia / Reflection:**
{{ highlight_note }}
{% else -%}
**Marginalia / Reflection:**
_I just liked the words_
{% endif %}
> [!quote]
> {{ highlight_text }}
> \- {% if highlight_location and highlight_location_url %}[{{ highlight_location }}]({{ highlight_location_url }}){% elif highlight_location %}{{ highlight_location }}{% endif %}
{%- if highlight_tags %}
**Tags:** {% for tag in highlight_tags %}{{ tag }}{% endfor %}
{%- endif %}

---
```

## YAML front matter

Don't include the triple dashes. Leave blank to disable YAML front matter altogether.

```python
{% macro slugify_and_fixup(s) -%}
{{ s
  | lower
  | replace('#', '')
  | replace('@', '')
  | replace('$', '')
  | replace('%', '')
  | replace('^', '')
  | replace('*', '')
  | replace('?', '')
  | replace('!', '')
  | replace(':', '')
  | replace(';', '')
  | replace('.', '')
  | replace(',', '')
  | replace("'", '')
  | replace('"', '')
  | replace('(', '')
  | replace(')', '')
  | replace('[', '')
  | replace(']', '')
  | replace('/', '-')
  | replace('|', '-')
  | replace('&', 'and')
  | replace(' ', '-')
  | replace('--', '-')
  | replace('--', '-')
  | trim
}}
{%- endmacro %}
{% macro fixup(s) -%}
{{ s
  | replace('*', '')
  | replace('--', '-')
  | trim
}}
{%- endmacro %}

title: "Highlights and Marginal Notes on {{author}} - {{fixup(title)}}"
date: {{last_highlighted_date}}
draft: false
slug: mgn-{{slugify_and_fixup(title)}}
categories:
  - marginalia
tags:{% for tag in document_tags %}
  - {{tag}}{% endfor %}
  - {{source}}
authors: "{{ '[[' ~ slugify_and_fixup(author) ~ '|' ~ author ~ ']]' }}"
{{category}}: "{{ full_title }}"
image: {% if image_url -%}{{image_url}}{%- endif -%}
```

## Sync notification

Special file containing sync notification entries. Leave blank to disable notification altogether.

```python

```
