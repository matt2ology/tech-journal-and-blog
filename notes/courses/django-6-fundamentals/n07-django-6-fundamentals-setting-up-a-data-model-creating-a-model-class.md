---
aliases: Notes on Django 6 Fundamentals - Setting Up a Data Model - Creating a Model Class
title: Notes on Django 6 Fundamentals - Setting Up a Data Model - Creating a Model Class
date: 2026-11-17T14:45:07-08:00
draft: false
slug: django-6-fundamentals-setting-up-a-data-model-creating-a-model-class
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6 Fundamentals
module: Setting up a Data Model
lesson: Creating a Model Class
---

**Analysis:** [[05-django-6-fundamentals-setting-up-a-data-model|Django 6 Fundamentals - Setting Up a Data Model]]

## TL;DR (too long; didn't read)

> [!tldr] Creating a Model Class Summary
>
> 1. **Create an app:** Run `python manage.py startapp django_app_name`
> 2. **Install the app:** Add its name to `INSTALLED_APPS` in `settings.py`
> 3. **Create a model:** Define a Python class in `models.py` that inherits from `models.Model`
> 4. **Define fields:** Add class attributes using Django field types (e.g., `CharField`, `DateField`), which become database columns
> 5. **Automatic setup:** Django automatically handles the model's `__init__()` method and generates the corresponding database table structure
> 6. **Database compatibility:** Django translates models into SQL commands compatible with your database (SQLite by default)

## Creating a Model Class

We group related components together in apps:

```shell
python manage.py startapp django_app_name
```

Now that the new Python package is created we have to install the app (i.e. in `my_project_name\settings.py`)

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_app_name', # Append newly created Django app
]
```

In `django_app_name\models.py` we create Python classes to "model" our data tables

All Django models need to inherit from the base class `models.Model`, so makes this an official Django model, and that means that it will represent a table in the database with corresponding column attributes

```python
from django.db import models

class TableInDataBase(models.Model):
    title = models.CharField(max_length=200)
    date = models.DateField()
```

Django does not conform to [typical Python object attributes defined in the `__init__()` method](https://www.w3schools.com/python/python_class_init.asp)

Django will inspect the attributes of the class and create a `__init__` method for us, and will also help us create a database table with the right columns so we can save django_app objects in that table.

What the table will look like exactly depends on the type of database you use. That might be MySQL or Oracle, etc.

By default, Django use SQLite, so will make sure to generate SQL commands to create the tables in such a way that our database understands it.

## Anatomy of a Django App

- **`admin.py`:** configures the admin interface
- **`apps.py`:** advance app configuration
- **`models.py`:** holds data models
- **`tests.py`:** contains unit tests
- **`views.py`:** contains view functions
