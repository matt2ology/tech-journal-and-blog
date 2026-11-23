---
aliases: Notes on Django 6 Fundamentals - Combining Model, View, and Template - Template Variables and Dynamic Content
title: Notes on Django 6 Fundamentals - Combining Model, View, and Template - Template Variables and Dynamic Content
date: 2026-11-22T22:11:05-08:00
draft: false
slug: django-6-fundamentals-combining-model-view-and-template-template-variables-and-dynamic-content
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6 Fundamentals
module: Combining Model, View, and Template
lesson: Template Variables and Dynamic Content
---

**Analysis:** [[05-django-6-fundamentals-combining-model-view-and-template|Django 6 Fundamentals - Combining Model, View, and Template]]

## TL;DR (too long; didn't read)

> [!tldr] Template Variables and Dynamic Content Summary
>
> Django templates dynamically generate HTML pages using data supplied by view functions, keeping Python logic (views) separate from HTML presentation (templates).
>
> 1. **Template variables are placeholders:** Django uses double curly braces `{{ variable_name }}` in HTML templates to represent dynamic values.
> 2. **Views provide the data:** View functions (`views.py`) pass template variables through a dictionary as the 3rd argument of `render()`.
> 3. **[The `render()` syntax](https://docs.djangoproject.com/en/6.1/topics/http/shortcuts/):**
>
>    ```python
>    render(request, template_name, context_dictionary)
>    ```
>
> 4. **Example of passing data to a template:**
>
>    ```python
>     render(
>       request,
>       "app_name/welcome.html",
>       {
>         "message": "Data from app_name welcome page",
>         "title": "Hello"
>       }
>     )
>    ```
>
> 5. **Display variables in HTML:** Use `{{ variable_name }}` anywhere in your HTML template, such as inside headings, paragraphs, or the page title.
> 6. **Dynamic content:** Template variables are filled with values when Django renders the template. These values can come from databases or other sources.

## Template Variables and Dynamic Content

- Template files are normal HTML files with Django's template variables: values surrounded by double curly braces (e.g., `{{template_variables}}`)
- **Template variables:** are placeholder values and is filled in when the template is rendered
- View methods (in `app_name\views.py`) supplies variables via a 3rd argument of the `render()` function via a dictionary
  - `render(request, template_name, context_dictionary)`
  - `render(request, "app_name/welcome.html", {"message": "Data from app_name welcome page", "title": "Hello"})`
- Values may come from a database
- Template variables can be placed everywhere in the HTML template
- Files in the templates directory dynamically generate HTML pages based on the data that are view functions sent to these templates.

```html
<!--templates\appname\home.html-->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>{{ title }}</title>
  </head>
  <body>
    <h1>{{ message }}</h1>
    <p>My first Django application is working!</p>
  </body>
</html>
```
