---
aliases: Analysis of Django 6 - Structure of a Django Application - the Data Model Layer
title: Analysis of Django 6 - Structure of a Django Application - the Data Model Layer
date: 2026-11-12T14:25:30-08:00
draft: true
slug: django-6-structure-of-a-django-application
categories:
  - analysis
tags: []
type: analysis
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6
module: Structure of a Django Application
---

**Synthesis:** [[00-django-6-synthesis|Django 6]]

<!-- Purpose: Transmute source materials (books, articles, podcasts, lecture notes) into active comprehension and extract candidate concepts. -->

## Key Takeaways & Core Concepts

<!-- A 2-3 sentence summary of the main argument or purpose in your own words. -->

> [!abstract] Executive Summary & Core Thesis
>
> 1. Django supports multiple databases, but **uses [SQLite](https://www.sqlite.org/) by default**
>    - MariaDB
>    - MySQL
>    - Oracle
>    - PostgreSQL
> 2. [[../../../notes/courses/django-6/n01-django-6-structure-of-a-django-application-the-data-model-layer#The Data Model Layer|The structure of the database tables reflects the structure of the Python classes]]
