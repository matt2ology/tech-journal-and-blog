---
aliases: Notes on Django 6 - Structure of a Django Application - the Data Model Layer
title: Notes on Django 6 - Structure of a Django Application - the Data Model Layer
date: 2026-11-12T14:59:04-08:00
draft: false
slug: django-6-structure-of-a-django-application-the-data-model-layer
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: "Django 6: The Big Picture"
module: Structure of a Django Application
lesson: The Data Model Layer
---

**Analysis:** [[03-django-6-structure-of-a-django-application|Django 6: the Big Picture - Structure of a Django Application]]

## TL;DR (too long; didn't read)

> [!tldr] The Data Model Layer Summary
>
> The structure of the database tables reflects the structure of the Python classes

## The Data Model Layer

File "models.py" contains the data model (i.e. the data structure for the application).

Each class defines a database table.

Example in `travel_blog\trip\models.py`, the instructor, Ekker for his travel blog website defines that a destination has a **name** and a **country**.

```py
class Destination(models.Model):
    name = models.CharField(max_lenght=100)
    country = models.CharField(max_lenght=100)
```

Another data model for the example blog website:

```py
class Picture(models.Model):
    image = models.ImageField(blank=True)
    name = models.CharField(max_lenght=100)
    caption = models.CharField(max_lenght=300, blank=True)
```

In the `db.sqlite3` navigation you'll find a tables for both "**destination**" and "**pictures**".

A trip can be defined with a bunch of fields and foreign keys (links to other tables).

```py
Class Trip(models.Model):
    author = models.ForeignKey(setting.AUTH_USER_MODEL, on_delete=models.PROTECT)
    destination = models.ForeignKey(Destination, on_delete=models.PROTECT)
    title = models.CharField(max_length=100)
    intro_text = models.TextField()
    main_picture = models.ForeignKey(Picture, on_delete=models.PROTECT, blank=True)

    create_date = models.DateTimeField(default=timezone.now)
    from_date = models.DateField()
    to_date = models.DateField()
```

where `main_picture` is linked to a specific row in the picture table.

The Django model layer is helpful, it can allow one to define ordering (using the minus sign `-`) with regards to the date started.

```py
class Meta:
    get_latest_by = ["to_date", "from_date"]
    ordering = ["-from_date", "-to_date"]
```
