---
aliases: Notes on Django 6 - Structure of a Django Application - Templates
title: Notes on Django 6 - Structure of a Django Application - Templates
date: 2026-11-12T22:28:18-08:00
draft: false
slug: django-6-structure-of-a-django-application-templates
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: "Django 6: The Big Picture"
module: Structure of a Django Application
lesson: Templates
---

**Analysis:** [[../../../analysis/courses/django-6-the-big-picture/03-django-6-structure-of-a-django-application|Django 6 - Structure of a Django Application]]

## TL;DR (too long; didn't read)

> [!tldr] Templates Summary
>
> When the user visits a page, the view function (from file **views.py**), the corresponding view function gets executes.
>
> The view function gets the data from the database and sends that data to the template that gets converted to HTML to be shown in the browser.
>
> Django template language enables loops and conditionals to create dynamic web pages.

## Templates

Template pages are stored in a folder, properly named, "templates".

Django has its own templating language (parts with curly braces are Django specific).

```django
{% extends `base.html` %}

{% block content %}
```

```django
{% for post in posts %}
```

```django
<a href="{% url `trip_detail` pk=post.id %}" class="hover:opacity-75">
```

```django
Visited {{ post.from_date }} - {{ post.to_date }}
```

Angle brackets are of the typical HTML code.
