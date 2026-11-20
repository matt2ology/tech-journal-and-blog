---
aliases: Notes on Django 6 Fundamentals - Setting Up a Data Model - Creating and Running Migrations
title: Notes on Django 6 Fundamentals - Setting Up a Data Model - Creating and Running Migrations
date: 2026-11-19T12:04:49-08:00
draft: false
slug: django-6-fundamentals-setting-up-a-data-model-creating-and-running-migrations
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6 Fundamentals
module: Setting up a Data Model
lesson: Creating and Running Migrations
---

**Analysis:** [[../../../analysis/courses/django-6-fundamentals/04-django-6-fundamentals-setting-up-a-data-model|Django 6 Fundamentals - Setting Up a Data Model]]

## TL;DR (too long; didn't read)

> [!tldr] Creating and Running Migrations Summary
>
> - **Create migrations:** Run `python manage.py makemigrations` to detect changes in your models and generate migration files describing the required database changes.
>   - **Migration files:** Django creates Python files in the app's `migrations/` directory that define the steps needed to update the database.
> - **Apply migrations:** Run `python manage.py migrate` to execute all pending migrations across installed apps and update the database schema.
> - **Table naming:** Django prefixes database table names with the app name (e.g., `django_app_name_tableindatabase`).
> - **View generated SQL:** Run `python manage.py sqlmigrate django_app_name 0001` to see the SQL Django generates for a specific migration.
> - **Database independence:** Migration files are written in Python, not SQL, allowing Django to generate database-specific SQL for SQLite, MySQL, PostgreSQL, etc.

## Creating and Running Migrations

```python
# django_app_name\models.py
from django.db import models

class DataModelName(models.Model):
    title = models.CharField(max_length=200)
    date = models.DateField()
```

After making a data model you must then run:

```bash
python manage.py makemigrations
```

What this command does is it looks at our models and determines what changes we need to do to the database in order to make the database match our model code

When run, Django will create a file in `django_app_name/migrations/####_initial.py`

In that file is some Python code for us that represents the steps needed to get our database to the right state

To actually run this SQL and create the table run:

```bash
python manage.py migrate
```

This will run all currently waiting migrations from all the apps in INSTALLED_APPS list

Note that the name of the table is prefixed with the name of our app for example: `django_app_name_tableindatabase`

### See the resulting SQL Code Produced

The migration script is not written in SQL because the migration is independent from the actual back end. In other words, we might run this against SQLite or MySQL or Postgres or any other database, and every time it would result in slightly different SQL because each database engine has its own SQL dialect

and to see the SQL produced we run the `sqlmigrate` command with two arguments

1. The name of our app
2. The name of the migration

```bash
python manage.py sqlmigrate django_app_name 0001
```

> [!caution] Make sure Django app is "installed"
> Make sure app is in the `INSTALLED_APPS` list in `my_project_name\settings.py`
>
> Otherwise Django will not pick up the models, and it won't create a migration
