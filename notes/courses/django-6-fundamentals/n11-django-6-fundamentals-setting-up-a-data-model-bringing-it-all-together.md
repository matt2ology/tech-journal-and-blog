---
aliases: Notes on Django 6 Fundamentals - Setting Up a Data Model - Bringing It All Together
title: Notes on Django 6 Fundamentals - Setting Up a Data Model - Bringing It All Together
date: 2026-11-19T15:38:44-08:00
draft: false
slug: django-6-fundamentals-setting-up-a-data-model-bringing-it-all-together
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6 Fundamentals
module: Setting up a Data Model
lesson: Bringing It All Together
---

**Analysis:** [[05-django-6-fundamentals-setting-up-a-data-model|Django 6 Fundamentals - Setting Up a Data Model]]

## TL;DR (too long; didn't read)

> [!tldr] Bringing It All Together Summary
>
> 1. **Register your app:** Make sure the Django app is listed in `INSTALLED_APPS` in `settings.py`.
> 2. **Modify models:** Make changes to model classes in `django_app_name/models.py`.
> 3. **Generate migrations:** Run `python manage.py makemigrations` to detect model changes and generate migration files.
> 4. **Handle non-nullable fields:** When adding a new field to a model that already has existing database records, Django may require a default value to populate that field for existing rows.
> 5. **Apply migrations:** Run `python manage.py migrate` to update the database schema.

## Bringing It All Together

Make sure your Django app is added to `INSTALLED_APPS` list in `my_project_name\settings.py`

Changes made to a model class in `django_app_name\models.py`

Generate migration script

```bash
python manage.py makemigrations
```

If a model class has new attributes and entries made from the pervious iteration of the data model

A warning prompt may appear

> [!warning] Non-Nullable Field
> It is not possible to add a non-nullable field 'field_name' to model 'ModelName' without a default; we can't do that (the database needs something to populate existing rows).

So, in `django_app_name\models.py` we can add a default value to the new attribute

Now, we can run the migration script to update the database schema

```bash
python manage.py migrate
```

We can add a string representation method to the model class in `django_app_name\models.py` to make it easier to identify records in the admin interface

```python
# django_app_name\models.py
from django.db import models

class person(models.Model):
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200)
    date_of_birth = models.DateField()
    date_of_death = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
```

`def __str__(self)` is a behavior and does not affect the database schema, won't require a migration script to be generated, and will not affect the database schema
