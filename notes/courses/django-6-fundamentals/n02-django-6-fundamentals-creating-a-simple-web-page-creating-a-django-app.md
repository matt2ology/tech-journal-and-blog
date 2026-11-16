---
aliases: Notes on Django 6 Fundamentals - Creating a Simple Web Page - Creating a Django App
title: Notes on Django 6 Fundamentals - Creating a Simple Web Page - Creating a Django App
date: 2026-11-15T21:25:44-08:00
draft: false
slug: django-6-fundamentals-creating-a-simple-web-page-creating-a-django-app
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6 Fundamentals
module: Creating a Simple Web Page
lesson: Creating a Django App
---

**Analysis:** [[03-django-6-fundamentals-creating-a-simple-web-page|Django 6 Fundamentals - Creating a Simple Web Page]]

## TL;DR (too long; didn't read)

> [!tldr] Creating a Django App Summary
>
> 1. Run the following command from the project folder (i.e. `project_name/`): `python manage.py startapp website`
> 2. Add the Django app to **`project_name/project_name/settings.py`**'s "application definition", [Python Lists](https://www.w3schools.com/python/python_lists.asp), `INSTALLED_APPS`

## Creating a Django App

A Django app is just a folder containing Python files.

In this case, the instructor, [[reindert-jan-ekker|Reindert-Jan Ekker]], adds an app that will contain general pages for the website like the welcome-page, a contact-page, an about-page, so calls the Django app "website".

```mermaid
treeView-beta
django-fundamentals/
    project_name/
        project_name/
        db.sqlite3
        manage.py
        main.py
```

In the project folder (i.e. `project_name/`), from the terminal, type the following:

```sh
python manage.py startapp website
```

**`project_name/manage.py`** creates the following directory and files:

```mermaid
treeView-beta
django-fundamentals/
    project_name/
        project_name/
        website/
            __init__.py
            admin.py
            apps.py
            models.py
            tests.py
            views.py
        db.sqlite3
        manage.py
        main.py
```

Now add the newly created **`project_name/website`** Django app to the **`project_name/project_name/settings.py`**'s

```python
# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'website', # Add Django app folder here
]
```

All new Django apps must be added can be seen and run by Django
