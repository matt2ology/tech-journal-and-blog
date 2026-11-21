---
aliases: Analysis of Django 6 Fundamentals - Setting Up a Data Model
title: Analysis of Django 6 Fundamentals - Setting Up a Data Model
date: 2026-11-16T23:13:31-08:00
draft: false
slug: django-6-fundamentals-setting-up-a-data-model
categories:
  - analysis
tags: []
type: analysis
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6 Fundamentals
module: Setting up a Data Model
---

**Synthesis:** [[../../../synthesis/courses/django-6-fundamentals/00-django-6-fundamentals-synthesis|Django 6 Fundamentals]]

## Key Takeaways & Core Concepts

> [!abstract] Setting up a Data Model Executive Summary & Core Thesis
>
> 1. **[[../../../notes/courses/django-6-fundamentals/n05-django-6-fundamentals-setting-up-a-data-model-introducing-models-and-migrations|Models]]:** Python classes that define database tables; model fields become database columns.
> 2. **[[../../../notes/courses/django-6-fundamentals/n07-django-6-fundamentals-setting-up-a-data-model-creating-a-model-class|Create an app]]:** Run `python manage.py startapp app_name` and register it in `INSTALLED_APPS` in `settings.py`.
> 3. **[[../../../notes/courses/django-6-fundamentals/n08-django-6-fundamentals-setting-up-a-data-model-creating-and-running-migrations|Define models]]:** Create classes in `models.py` that inherit from `models.Model`.
> 4. **[[../../../notes/courses/django-6-fundamentals/n06-django-6-fundamentals-setting-up-a-data-model-running-initial-migrations|Generate migrations]]:** Run `python manage.py makemigrations` to detect model changes and create migration files.
> 5. **[[../../../notes/courses/django-6-fundamentals/n08-django-6-fundamentals-setting-up-a-data-model-creating-and-running-migrations|Apply migrations]]:** Run `python manage.py migrate` to update the database schema and create or modify tables.
> 6. **[[../../../notes/courses/django-6-fundamentals/n06-django-6-fundamentals-setting-up-a-data-model-running-initial-migrations|Check migrations]]:** Use `python manage.py showmigrations` to view available and applied migrations.
> 7. **[[../../../notes/courses/django-6-fundamentals/n12-django-6-fundamentals-setting-up-a-data-model-another-model|Database relationships]]:** Use `ForeignKey` to connect models. `on_delete=models.CASCADE` deletes related records when the referenced record is deleted.
> 8. **[[../../../notes/courses/django-6-fundamentals/n06-django-6-fundamentals-setting-up-a-data-model-running-initial-migrations#SQLite Shell Interface|Database inspection]]:** Use `python manage.py dbshell` and SQLite commands such as `.tables` and `SELECT * FROM django_migrations;` to inspect database tables and migration history.
> 9. **[[../../../notes/courses/django-6-fundamentals/n09-django-6-fundamentals-setting-up-a-data-model-the-admin-interface|Admin interface]]:** Register models in `admin.py`, create an admin account with `python manage.py createsuperuser`, and access `/admin` to manage records.
> 10. **[[../../../notes/courses/django-6-fundamentals/n10-django-6-fundamentals-setting-up-a-data-model-review#Review|Automatic database management]]:** Django generates database-specific SQL, assigns unique primary keys, and supports multiple database engines, including SQLite, PostgreSQL, MySQL, MariaDB, and Oracle.
> 11. **[[../../../notes/courses/django-6-fundamentals/n11-django-6-fundamentals-setting-up-a-data-model-bringing-it-all-together|Important precautions]]:** Adding non-nullable fields may require default values for existing records. Never casually delete databases or migration files in production because this can cause permanent data loss.

## Data Model Setup Workflow

1. Create a Django app and register it in `INSTALLED_APPS` in `settings.py`
2. Define model classes in `models.py` that inherit from `models.Model`.

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## Lesson Notes

[[../../../notes/courses/django-6-fundamentals/n05-django-6-fundamentals-setting-up-a-data-model-introducing-models-and-migrations|Introducing Models and Migrations]]
[[../../../notes/courses/django-6-fundamentals/n06-django-6-fundamentals-setting-up-a-data-model-running-initial-migrations|Running Initial Migrations]]
[[../../../notes/courses/django-6-fundamentals/n07-django-6-fundamentals-setting-up-a-data-model-creating-a-model-class|Creating a Model Class]]
[[../../../notes/courses/django-6-fundamentals/n08-django-6-fundamentals-setting-up-a-data-model-creating-and-running-migrations|Creating and Running Migrations]]
[[../../../notes/courses/django-6-fundamentals/n09-django-6-fundamentals-setting-up-a-data-model-the-admin-interface|the Admin Interface]]
[[../../../notes/courses/django-6-fundamentals/n10-django-6-fundamentals-setting-up-a-data-model-review|Review]]
[[../../../notes/courses/django-6-fundamentals/n11-django-6-fundamentals-setting-up-a-data-model-bringing-it-all-together|Bringing It All Together]]
[[../../../notes/courses/django-6-fundamentals/n12-django-6-fundamentals-setting-up-a-data-model-another-model|Another Model]]
