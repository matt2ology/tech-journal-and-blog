---
aliases: Notes on Django 6 - Choosing Django - Django Strengths
title: Notes on Django 6 - Choosing Django - Django Strengths
date: 2026-11-13T15:32:12-08:00
draft: false
slug: django-6-choosing-django-django-strengths
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6
module: Choosing Django
lesson: Django Strengths
---

**Analysis:** [[04-django-6-choosing-django|Django 6 - Choosing Django]]

## TL;DR (too long; didn't read)

> [!tldr] Django Strengths Summary
>
> Django is a backend framework, so serves static pages. If an interactive user interface is needed one would need to combine Django with a JavaScript frontend framwork.
>
> Django is a mature backend framework with a thriving community, built using Python, and extend in functionality via packages.

## Django Strengths

- Is a backend framework - not a frontend framework
  - Serve static HTML pages
  - Will need to combine with a JavaScript framework (e.g. React, Angular, HTMX, etc.)
- Written in Python
- Comes with "batteries" (i.e. has standard and common features expected when building a web app)
- Is mature - is an established technology with a community
- [Great documentation](https://docs.djangoproject.com/en/6.1/)
- Has an [ecosystem of packages](https://djangopackages.org/) for features that extends Django functionality
  - [Django REST framework](https://djangopackages.org/packages/p/django-rest-framework/) will help you build APIs
  - [Channels (websockets)](https://djangopackages.org/packages/p/channels/) will add support for web sockets and background tasks
  - [A curated list of awesome things related to Django](https://awesomedjango.org/). Maintained by [Will Vincent](https://github.com/wsvincent) and [Jeff Triplett](https://github.com/jefftriplett).
