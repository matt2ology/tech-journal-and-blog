---
aliases: Notes on Django 6 - Choosing Django - Python Alternatives
title: Notes on Django 6 - Choosing Django - Python Alternatives
date: 2026-11-13T15:58:12-08:00
draft: false
slug: django-6-choosing-django-python-alternatives
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: "Django 6: The Big Picture"
module: Choosing Django
lesson: Python Alternatives
---

**Analysis:** [[../../../analysis/courses/django-6-the-big-picture/04-django-6-choosing-django|Django 6 - Choosing Django]]

## TL;DR (too long; didn't read)

> [!tldr] Python Alternatives Summary
>
> - [Django](https://www.djangoproject.com/): a fully featured web application framework
> - [Flask](https://flask.palletsprojects.com/en/stable/): microframework - good for smaller projects
> - [FastAPI](https://fastapi.tiangolo.com/): for highly performant REST APIs

## Python Alternatives

### [Flask](https://flask.palletsprojects.com/en/stable/)

- Flask is a microframework (intentionally has as few features as possible), so some assembly is required (batteries not included).
  - Does not come with a **model layer** or an **admin interface**.
- Because batteries are not included and some assembly is required - you will need to build out or install external packages; and so, one would need to keep the libraries up-to-date independently from other packages, and changes in one dependency might break how it works together with the other packages.
- Has the Jinja template language, which is slightly more powerful than the Django template language.
- Good for small and simple projects or proof-of-concepts
- REST APIs
  - Provide a service for other software
  - Backend for a JavaScript frontend (e.g. React)

### [FastAPI](https://fastapi.tiangolo.com/)

- FastAPI focuses on REST APIs
- High performance
- Auto generate documentation for endpoints and JSON messages
- Like [Flask](https://flask.palletsprojects.com/en/stable/), [FastAPI](https://fastapi.tiangolo.com/) has a smaller feature set than that of [Django](https://www.djangoproject.com/)
  - It **doesn't have** a **model layer or** even a **template language**
  - Need mix and match with external packages to build-out a project
