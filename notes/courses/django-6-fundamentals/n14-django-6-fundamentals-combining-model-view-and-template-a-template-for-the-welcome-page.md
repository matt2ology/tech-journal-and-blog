---
aliases: Notes on Django 6 Fundamentals - Combining Model, View, and Template - A Template for the Welcome Page
title: Notes on Django 6 Fundamentals - Combining Model, View, and Template - A Template for the Welcome Page
date: 2026-11-20T21:26:45-08:00
draft: false
slug: django-6-fundamentals-combining-model-view-and-template-a-template-for-the-welcome-page
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6 Fundamentals
module: Combining Model, View, and Template
lesson: A Template for the Welcome Page
---

**Analysis:** [[05-django-6-fundamentals-combining-model-view-and-template|Django 6 Fundamentals - Combining Model, View, and Template]]

## TL;DR (too long; didn't read)

> [!tldr] A Template for the Welcome Page Summary
>
> 1. **Templates display content to users:** In web applications, displaying data means creating a web page using HTML.
> 2. **Connect views and templates:** Django views call templates and pass data to them to display.
> 3. **Separation of concerns:**
>    - **Views (`views.py`):** Handle Python code and application logic.
>    - **Templates (`.html`):** Handle the HTML and presentation of content.
> 4. **Follow Django's template folder structure:** Store templates in `django_app/templates/django_app/` rather than directly in the `templates` folder.
> 5. **Prevent naming conflicts:** Creating a folder named after your app helps distinguish templates when multiple apps have files with the same name.
> 6. **Render templates from views:** Use Django's `render()` function inside a view to display a template.
> 7. **`render()` arguments:**
>    - **Argument 1** - `request`: An object containing information about the browser's request, such as cookies and HTTP headers.
>    - **Argument 2 - Template name:** The name/path of the HTML template you want Django to render.

## A Template for the Welcome Page

- Templates display contents to user
- In web applications "displaying data" means creating a web page, by way of HTML
  - Call templates from view
  - Pass data from view to template
- Separation of concerns
  - Python code (view functions)
  - HTML code (templates)
- Django has a default location where it expects these templates to be: `django_app/templates/django_app`
  - **Best practice** is not to put your files directly in the templates folder, but to **create another folder with the name of your app** (i.e., `django_app/templates/django_app`)
  - **Prevent name clashes:** several apps might have templates by the same name, but putting them in a folder with the name of your app makes sure we can tell them apart.
- After creating HTML code for your Django app, we need to use the template from the view (i.e. `django_app/views.py`) function via `render()` in this function we provide:
  - **Argument 1:** `request` an object that holds all kinds of information about the requests that the browser sent, like cookies, HTTP headers and more.
  - **Argument 2:** the name of the template file that we want to render
