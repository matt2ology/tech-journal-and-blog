---
aliases: Notes on Django 6 Fundamentals - Setting Up a Data Model - Review
title: Notes on Django 6 Fundamentals - Setting Up a Data Model - Review
date: 2026-11-19T14:50:26-08:00
draft: false
slug: django-6-fundamentals-setting-up-a-data-model-review
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6 Fundamentals
module: Setting up a Data Model
lesson: Review
---

**Analysis:** [[05-django-6-fundamentals-setting-up-a-data-model|Django 6 Fundamentals - Setting Up a Data Model]]

## TL;DR (too long; didn't read)

> [!tldr] Review Summary
>
> - **Purpose of models:** Models allow Python objects to be stored in a database so that data persists even after the server stops running.
> - **Model-to-database mapping:** Each Django model class maps to a database table, and its class attributes (fields) map to the table's columns.
> - **Model requirements:** Model classes must inherit from `models.Model` and are defined in the app's `models.py`.
> - **Automatic SQL generation:** Django generates and executes database-specific SQL to create tables, update schemas, and insert, update, or delete records.
> - **Database support:** Django supports several database engines, including SQLite (default), PostgreSQL, MariaDB, MySQL, and Oracle.
>
> **Migration workflow:**
>
> 1. Make sure the app is registered in `INSTALLED_APPS`.
> 2. Create or modify model classes in `models.py`.
> 3. Run `python manage.py makemigrations` to generate migration files.
> 4. (Optional) Run `python manage.py showmigrations` to see migration status.
> 5. Run `python manage.py migrate` to apply pending migrations.
>
> **Admin interface:**
>
> - Create an admin account using `python manage.py createsuperuser`.
> - Register models in the app's `admin.py` using `admin.site.register(ModelName)`.
> - Once registered, models can be managed through Django's admin interface.

## Review

The entire purpose of models is to make it possible to save Python objects in a database so that the data keeps existing after the server stops running

Model classes are mapped to tables in the database:

- A [data model](https://docs.djangoproject.com/en/6.1/ref/models/fields/), this will result in a corresponding table in the database
- In that table, the columns correspond to the fields of the model class

Django will make sure to generate the SQL:

- It creates the tables and columns for model classes when migrations (i.e. `python manage.py makemigrations`) is run
- Executes the SQL we need to update, insert or delete data when we manage our data through the admin interface

In the standard Django install, there's support for several databases (but not limited to), Postgress, MariaDB, MySQL, Oracle, and SQLite

A [model class](https://docs.djangoproject.com/en/6.1/ref/models/fields/) for which Django can generate a database table and is written in `django_app_name\models.py`

All data model classes needs to inherit from the Django model superclass `models.Model`, so to be mapped to a database table

```python
# django_app_name\models.py
from django.db import models

class Person(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerFields()
```

## Migration Workflow

1. Make sure your Django app is added to `INSTALLED_APPS` list in `my_project_name\settings.py`
2. Changes made to a model class in `django_app_name\models.py`
3. Generate migration script: `python manage.py makemigrations`
   - Optional - see an overview of all migrations: `python manage.py showmigrations`
4. Run the pending migrations: `python manage.py migrate`

## Registering Models with the Admin Site

Create a superuser with

```bash
python manage.py createsuperuser
```

To register a model with the admin site add a few line of code in `django_app_name\apps.py`

1. import both the admin package, done by default, `from django.contrib import admin`
2. The model class `from .models import DataModelName`
3. `admin.site.register(DataModelName)`

```python
# django_app_name\models.py
from django.db import models

class DataModelName(models.Model):
    pass
```

```python
# django_app_name\admin.py
from django.contrib import admin
from django_app_name.models import DataModelName

# Register your models here
admin.site.register(DataModelName)
```
