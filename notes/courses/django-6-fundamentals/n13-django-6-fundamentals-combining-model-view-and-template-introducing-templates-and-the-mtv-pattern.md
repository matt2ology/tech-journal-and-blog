---
aliases: Notes on Django 6 Fundamentals - Combining Model, View, and Template - Introducing Templates and the MTV Pattern
title: Notes on Django 6 Fundamentals - Combining Model, View, and Template - Introducing Templates and the MTV Pattern
date: 2026-11-20T21:11:35-08:00
draft: false
slug: django-6-fundamentals-combining-model-view-and-template-introducing-templates-and-the-mtv-pattern
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6 Fundamentals
module: Combining Model, View, and Template
lesson: Introducing Templates and the MTV Pattern
---

**Analysis:** [[05-django-6-fundamentals-combining-model-view-and-template|Django 6 Fundamentals - Combining Model, View, and Template]]

## TL;DR (too long; didn't read)

> [!tldr] Introducing Templates and the MTV Pattern Summary
>
> The module covers:
>
> 1. Templates
> 2. The Model-Template-View (MTV), A.K.A. Mode-View-Controller (MVC), pattern
>    - Modern web framework
>    - Python frameworks
> 3. Return 404 errors to user

## Introducing Templates and the MTV Pattern

- Model-Template-View (MTV) pattern as means to organize code
  - Also known as: Model-View-Controller
- Orchestrate all 3 components: models, templates, and views
  - Call model from view
  - Call template from view
  - View parameters in URLs to our view functions
  - Learn how to return 404s errors
