---
aliases:
  - Django Initial Start-Up
title: Django Initial Start-Up
date: 2026-11-21T18:28:34-08:00
draft: false
slug: django-initial-start-up
categories:
  - blog
  - tutorials-guide
tags:
  - django
  - python
type: blog
---

Initial steps to get started with Django learned from [[../synthesis/courses/django-6-fundamentals/00-django-6-fundamentals-synthesis|PluralSight course Django 6 Fundamentals by Reindert-Jan Ekker]]

1. Setup Python Virtual Environment

   ```bash
   py -m venv .venv
   ```

   - [Activate Python virtual environment (operating system dependent)](https://docs.python.org/3/library/venv.html)

2. Install Django

   ```bash
   python.exe -m pip install --upgrade pip
   pip install django
   django-admin --version
   ```

3. Create your project

   ```bash
   django-admin startproject project_name
   ```

4. **Run initial database migrations:** run `python manage.py makemigrations` to detect model changes and create migration files.

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Start the development server

   ```bash
   python manage.py runserver
   ```

After making sure everything is in "proper" order, we can start divide-and-conquer, build up components of our Django project with the [[django-app-creation-workflow|App Creation Workflow]].
