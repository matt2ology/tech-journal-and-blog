---
aliases: Notes on Django 6 Fundamentals - Setting Up a Data Model - the Admin Interface
title: Notes on Django 6 Fundamentals - Setting Up a Data Model - the Admin Interface
date: 2026-11-19T13:19:38-08:00
draft: false
slug: django-6-fundamentals-setting-up-a-data-model-the-admin-interface
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6 Fundamentals
module: Setting up a Data Model
lesson: The Admin Interface
---

**Analysis:** [[../../../analysis/courses/django-6-fundamentals/04-django-6-fundamentals-setting-up-a-data-model|Django 6 Fundamentals - Setting Up a Data Model]]

## TL;DR (too long; didn't read)

> [!tldr] The Admin Interface Summary
>
> 1. **Admin interface:** Django automatically provides an admin interface that allows you to create, view, and edit database records through a web UI.
> 2. **Register data models:** Add your model to `admin.py` using `admin.site.register(ModelName)` so it appears in the admin interface.
> 3. **Create a superuser:** Run `python manage.py createsuperuser` to create an admin account with a username and password.
> 4. **Start the server:** Run `python manage.py runserver` and navigate to `http://127.0.0.1:8000/admin` to access the admin interface.
> 5. **Manage records:** Log in with your superuser credentials to manage registered models and their records.
> 6. **Unique IDs:** Django automatically assigns each database record a unique ID (primary key), which appears in the admin interface.

## The Admin Interface

Django auto‑generates an interface called the "admin interface" that

- Allows one create and edit model data
- One would need to register a model with the admin site
- One would need to configure a superuser account to log-in to the admin interface

By default, Django creates the admin app

```python
# my_project_name\settings.py
# Application definition

INSTALLED_APPS = [
    'django.contrib.admin', # Included by default
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]
```

To be able to create and edit meetings in the admin interface one would need to register the data model class in `django_app_name\admin.py`, so it shows up in the user interface (UI)

```python
# django_app_name\admin.py
from django.contrib import admin
from django_app_name.models import DataModelName

# Register your models here
admin.site.register(DataModelName)
```

Once our data model (i.e., `django_app_name\models.py`) is registered with `django_app_name\admin.py`

Before viewing we'd need to create a superuser account run:

```bash
python manage.py createsuperuser
```

where it will ask to set up both a username and password

To test we can start the development server and view at <http://127.0.0.1:8000/admin>

```bash
python manage.py runserver
```

After log in you'll see three models here, Users, Groups, and the, now registered, django_app_name

When adding entries in the data model Django will produce a list of all entry objects with an appended unique ID for each entry object
