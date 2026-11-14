---
aliases: Analysis of Django 6 Fundamentals - Starting a Django Project
title: Analysis of Django 6 Fundamentals - Starting a Django Project
date: 2026-11-14T00:07:41-08:00
draft: false
slug: django-6-fundamentals-starting-a-django-project
categories:
  - analysis
tags: []
type: analysis
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6 Fundamentals
module: Starting a Django Project
---

**Synthesis:** [[00-django-6-fundamentals-synthesis|Django 6 Fundamentals]]

<!-- Purpose: Transmute source materials (books, articles, podcasts, lecture notes) into active comprehension and extract candidate concepts. -->

## Key Takeaways & Core Concepts

<!-- A 2-3 sentence summary of the main argument or purpose in your own words. -->

> [!abstract] Executive Summary & Core Thesis
>
> 1. **[Install the latest Django release](https://www.djangoproject.com/download/):** `python -m pip install django`
> 2. **[Created a Django project](https://docs.djangoproject.com/en/6.1/intro/tutorial01/):** `django-admin startproject my-project-name`
>    - Be sure the virtual environment (`.venv`) is active: the django‑admin script is installed inside the `.venv`
> 3. Move into the project directory: `cd my-project-name`
> 4. Run the development server: `python manage.py runserver`
>    - To stop the server hit `CTRL+C` on the keyboard in the terminal

The Django project folder structure are as follows

- At the root we have the Django project folder: my-project-name
- The 2nd folder of the same name (i.e. my-project-name/my-project-name) contains the Django project settings - think this as **"the core project folder"**.

The backbone of a Django web application: **`settings.py`** and **`urls.py`**

The **`manage.py`** script and the **SQLite database (`db.sqlite3`)** is created by running the server: terminal command - `python manage.py runserver`

## Start a [Pycharm](https://www.jetbrains.com/pycharm/) project

Using Jetbrains' Pycharm

1. new > project 2. Provide location (`C:\Users\username\Documents\course-demos\django-fundamentals`) 3. Default settings is good enough, so can just hit "Create"

## [Install Django](https://www.djangoproject.com/download/)

1. Pycharm should instantiate a [Python virtual environment (best practice)](https://www.w3schools.com/python/python_virtualenv.asp) for us
2. Opening the terminal (`Alt+F12`) we should see `(.venv)` prepending our command-line prompt (e.g. `(.venv) PS C:\Users\username\Documents\course-demos\django-fundamentals >`)
3. **Install Django via the terminal:**

   ```shell
   python -m pip install Django
   ```

   this downloads and installs Django, as well as its dependencies.

## [Create a Django project](https://docs.djangoproject.com/en/6.1/intro/tutorial01/)

1. Start a Django project by running a script called **`django‑admin`**
   - [**`django‑admin`**](https://docs.djangoproject.com/en/6.1/ref/django-admin/) script can do many things, but commonly it's used to start a new project

     ```shell
     django‑admin startproject my-project-name
     ```

2. A file here called **`manage.py`** is a script used to run Django commands

## Run the project

To run the **`manage.py`** script one would need to navigate into the project root directory

```shell
cd my-project-name
```

We can now run the project by

 

```shell
python manage.py runserver
```

This runs the Django development web server, and it prints some information.

The Django development web server is a fast and lightweight web server that will reload the changes in code automatically.

Stop the server by using keyboard combination: `Ctrl+c`

The Django production server is not secure or performant enough for a real‑world deployment environment.

## Inspect the results

There's a new file here called **`db.sqlite3`**, and that's a database file that Django created automatically when we ran the server.

There's a second my-project-name folder basically think of this folder as the **"core project folder"**.

Inside the **"core project folder"** it contains:

- **`__init__.py`:** is empty - only to mark that the folder is a Python package
- **`settings.py`:** basically where our project is defined.
- **`urls.py`:** code that assigns URLs to the pages that we will create
- **`asgi.py` and `wsgi.py`:** used to deploy the project to a production server
