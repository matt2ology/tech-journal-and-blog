---
aliases: Notes on Django 6 - Structure of a Django Application - Database Migrations
title: Notes on Django 6 - Structure of a Django Application - Database Migrations
date: 2026-11-12T16:55:12-08:00
draft: false
slug: django-6-structure-of-a-django-application-database-migrations
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: "Django 6: The Big Picture"
module: Structure of a Django Application
lesson: Database Migrations
---

**Analysis:** [[03-django-6-structure-of-a-django-application|Django 6 - Structure of a Django Application]]

## TL;DR (too long; didn't read)

> [!tldr] Database Migrations Summary
>
> 1. Update the corresponding data model class
> 2. Run both **`python manage.py makemigrations`** and **`python manage.py migrate`**
>    - Detect the changes and make the changes to the database

## Database Migrations

Requirements may change and data models will be required to be updated

```python
class Destination(models.Model):
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
```

Is as easy as updating the corresponding data class

```python
class Destination(models.Model):
    name = models.CharField(max_length=100)
    state = models.CharField(max_length=100, default="")
    country = models.CharField(max_length=100)
```

and running these 2 commands

```sh
python manage.py makemigrations
python manage.py migrate
```

1. **`python manage.py makemigrations`:** detect the changes made and decides what needs to be done to update the database
2. **`python manage.py migrate`:** makes the changes to the database
