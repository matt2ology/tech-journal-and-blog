---
aliases: "Notes on Django 6 Fundamentals - Combining Model, View, and Template - A Template for the Welcome Page"
title: "Notes on Django 6 Fundamentals - Combining Model, View, and Template - A Template for the Welcome Page"
date: 2026-11-20T21:26:45-08:00
draft: true
slug: django-6-fundamentals-combining-model-view-and-template-a-template-for-the-welcome-page
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: "Django 6 Fundamentals"
module: "Combining Model, View, and Template"
lesson: "A Template for the Welcome Page"
---

**Analysis:** [[05-django-6-fundamentals-combining-model-view-and-template|Django 6 Fundamentals - Combining Model, View, and Template]]

## TL;DR (too long; didn't read)

> [!tldr] A Template for the Welcome Page Summary
>
> 1.

## A Template for the Welcome Page

- Templates display contents to user
- In web applications "displaying data" means creating a web page, by way of HTML
  - Call templates from view
  - Pass data from view to template
- Separation of concerns
  - Python code (view functions)
  - HTML code (templates)
- Django has a default location where it expects these templates to be: `django_app/templates/django_app`
  - **Best practice** is not to put your files directly in the templates folder, but to **create another folder with the name of your app**
  - **Prevent name clashes:** several apps might have templates by the same name, but putting them in a folder with the name of your app makes sure we can tell them apart.
- After creating HTML code for your Django app, we need to use the template from the view (i.e. `django_app/views.py`) function via `render()`
