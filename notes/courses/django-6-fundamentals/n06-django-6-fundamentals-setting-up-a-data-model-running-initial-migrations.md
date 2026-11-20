---
aliases: Notes on Django 6 Fundamentals - Setting Up a Data Model - Running Initial Migrations
title: Notes on Django 6 Fundamentals - Setting Up a Data Model - Running Initial Migrations
date: 2026-11-17T10:30:32-08:00
draft: false
slug: django-6-fundamentals-setting-up-a-data-model-running-initial-migrations
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6 Fundamentals
module: Setting up a Data Model
lesson: Running Initial Migrations
---

**Analysis:** [[05-django-6-fundamentals-setting-up-a-data-model|Django 6 Fundamentals - Setting Up a Data Model]]

## TL;DR (too long; didn't read)

> [!tldr] Running Initial Migrations Summary
>
> 1. Django apps are registered in `INSTALLED_APPS` inside `settings.py`.
> 2. **Check available and applied migrations:** `python manage.py showmigrations`
> 3. **Apply all pending migrations** and create the necessary database tables: `python manage.py migrate`
> 4. **Access the SQLite database shell:** `python manage.py dbshell`
> 5. Run `.tables` to list database tables. Prefixes such as `auth_` and `django_` identify the tables' origins.
> 6. Run `SELECT * FROM django_migrations;` to inspect executed migrations and their timestamps.
> 7. Run `.exit` to leave the SQLite shell.

## Running Initial Migrations

In **`project_name/project_name/settings.py`** there a a number of apps included by default in the project listed in `INSTALLED_APPS`

When running the server

```python
python manage.py runserver
```

If there are unmigrated changes from data models - on build there should be some output.

We can see what are those changes with this command

```python
 python manage.py showmigrations
```

After review one can run all currently pending migrations

```python
python manage.py migrate
```

## SQLite Shell Interface

```bash
sqlite>
```

We can check the migrations and created some tables by running

```python
python manage.py dbshell
```

This will ask Django to make a connection with the database

> [!caution] Running `python manage.py dbshell`
> This command might not work for you because you may need to [install SQLite](https://www.sqlite.org/download.html) separately.

To show tables in the database run

```sh
.tables
```

Note that each table name is prefixed with either `auth_` or `django_`

Most of the time this is the name of the app it belongs to, so we see that the `auth_` app provides us with tables for users, groups, and permissions

The prefix `django_` don't belong to any specific app

### `django_migrations`

To view we'd need to run an SQL select statement

```sh
select * from django_migrations
```

And now you'll see a line for every migration that has been executed. It shows each migration we just ran with the exact time that it happened

```sh
.exit
```

Leave the SQLite database shell
