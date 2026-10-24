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
{% macro slug(s, length) -%}
{{ s
| lower
| replace('#','-')
| replace('*','-')
| replace(':','-')
| replace("and","")
| replace(' ','-')
| replace(' - ','-')
| replace(' -','-')
| replace('- ','-')
| replace('..','')
| replace('.','-')
| replace('"','')
| replace("'","")
| replace('…','-')
| replace('(','')
| replace(')','')
| replace(',','')
| replace('|','')
| replace('/','')
| replace('--','-')
| truncate(length, True, '')
| replace('--','-')
| replace('^-','')
| replace('-$','')
}}
{%- endmacro %}

{% if image_url -%}

![rw-book-cover]({{image_url}})

Source published date: {{published_date}}

{% endif -%}
{% if url -%}
**Source link:** [{{full_title}}]({{url}})
{% else %}
source: {{source}}
{% endif -%}
<!-- Line brake - br -->
- [ ] **Literature note:** [[{{ slug(author, 50) }}-{{ slug(title, 50) }}]]
```

## Highlights header

Header text above each set of synced highlights. Leave blank to omit header.

```python
{% if is_new_page %}
## Highlights
{% elif has_new_highlights -%}
## New highlights added {{date|date('F j, Y')}} at {{time}}
{% endif -%}
```

## Highlight

The formatting of each individual highlight.

```python

---

{% if highlight_location == "View Highlight" %}### id{{ highlight_id }}{% elif highlight_location == "View Tweet" %}### id{{ highlight_id }}{% else %}### {{highlight_location}}{% endif %}
{% if highlight_tags %}**Tags:** {{ highlight_tags|join(', ') }} {% endif %}
> [!cite]
> {{ highlight_text }}{% if highlight_location_url %}
> \- [{{ highlight_location }}]({{ highlight_location_url }}) {% elif highlight_location %} > \- {{ highlight_location }}
{% endif %}
{% if highlight_note %}
**Marginalia / Reflection:**
{{ highlight_note }} {% endif %}
```

## YAML front matter

Don't include the triple dashes. Leave blank to disable YAML front matter altogether.

```python
{% macro fixup(s) -%}
{{ s
| replace('*','')
| replace('--','-')
| replace('^-','')
| replace('-$','')
}}
{%- endmacro %}

aliases: "Highlights of {{author}} - {{fixup(title)}}"
authors: {{author}}
categories:
  - highlights
  - {{category}}
date: {{date|date("Y-m-d")}}
draft: true
media: {{category}}
source: {{source}}
tags: {% for tag in document_tags %}
  - {{tag}} {% endfor %}
title: "Highlights of {{author}} - {{fixup(title)}}"
```

## Sync notification

Special file containing sync notification entries. Leave blank to disable notification altogether.

```python

```
