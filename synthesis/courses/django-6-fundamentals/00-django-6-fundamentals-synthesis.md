---
aliases:
  - Course synthesis of Django 6 Fundamentals
title: Course Synthesis of Django 6 Fundamentals
date: 2026-11-13T22:25:57-08:00
draft: true
slug: django-6-fundamentals
categories:
  - synthesis
  - courses
tags:
  - django
  - python
type: synthesis
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6 Fundamentals
---

**Course link:** https://www.pluralsight.com/courses/fundamentals-django

## Django 6 Fundamentals

<!-- A 2-3 sentence summary of the main argument or purpose in your own words. -->

> [!summary] The Core Concept
> Synthesize the main argument in 2–3 sentences. Why was this written, and what is its primary claim?

## Module Breakdown

1. [[../../../analysis/courses/django-6-fundamentals/02-django-6-fundamentals-starting-a-django-project|Start a Django Project]]
2. [[../../../analysis/courses/django-6-fundamentals/03-django-6-fundamentals-creating-a-simple-web-page|Create a Simple Web Page]]
3. [[../../../analysis/courses/django-6-fundamentals/04-django-6-fundamentals-setting-up-a-data-model|Setting-up a Data Model]]
4. [[../../../analysis/courses/django-6-fundamentals/05-django-6-fundamentals-combining-model-view-and-template|Combining Model, View, and Template]]
5. [[../../../analysis/courses/django-6-fundamentals/06-django-6-fundamentals-urls-and-link-building|URLs and Link Building]]
6. [[../../../analysis/courses/django-6-fundamentals/07-django-6-fundamentals-templates-styling-and-static-content|Templates, Styling, and Static Content]]
7. [[../../../analysis/courses/django-6-fundamentals/08-django-6-fundamentals-adding-user-interaction-with-modelforms|Adding User Interaction with ModelForms]]
8. [[../../../analysis/courses/django-6-fundamentals/09-django-6-fundamentals-editing-meetings-and-authentication|Editing Meetings and Authentication]]

## Foundational Concepts

### Initial Start-up

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

### App Creation workflow

1. **Create a Django app:** Django projects are organized into smaller applications
   - App names should be brief, but descriptive enough to clearly indicate the app's functionality

   ```bash
   python manage.py startapp appname
   ```

2. **Register app:** Append Django App name to `django_project`'s config folder located in `project_name\project_name\settings.py` to `INSTALLED_APPS` list.

   ```python
   INSTALLED_APPS = [
       'django.contrib.admin',
       'django.contrib.auth',
       'django.contrib.contenttypes',
       'django.contrib.sessions',
       'django.contrib.messages',
       'django.contrib.staticfiles',
       'appname', # Custom apps
   ]
   ```

3. **Configure project-level templates `project_name/settings.py`:** Find the `TEMPLATES` configuration and update `DIRS`

    ```python
    from pathlib import Path

    BASE_DIR = Path(__file__).resolve().parent.parent

    TEMPLATES = [
        {
            # look for templates in your project-level `templates` directory
            'DIRS': [BASE_DIR / 'templates'],
        },
    ]
    ```

4. **Create the templates directory (template namespacing):** Create a separate folder for each app inside the root `templates` directory
5. **Create models:** Models define the structure of your application's database

   ```python
   # appname\models.py
   from django.db import models

   class Article(models.Model):
       title = models.CharField(max_length=200)
       content = models.TextField()
       created_at = models.DateTimeField(auto_now_add=True)
       updated_at = models.DateTimeField(auto_now=True)

       def __str__(self):
           return self.title
   ```

6. **Create database migrations** and **apply database migrations**

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Register models in Django Admin:** To manage your model records through Django's administration interface, open `appname/admin.py`:

   ```python
   # appname/admin.py
   from django.contrib import admin
   from .models import Article

   admin.site.register(Article)
   ```

   Create an admin account if haven't already:

   ```bash
   python manage.py createsuperuser
   ```

8. **Create views:** `appname/views.py` handle incoming requests, interact with models, and return responses.

   ```python
   # appname/views.py
   from django.shortcuts import render
   from .models import Article

   def home(request):
       articles = Article.objects.all().order_by('-created_at')
       context = {
           'page_title': 'Home',
           'articles': articles,
       }
       return render(request, 'core/home.html', context)
   ```

9. **Create HTML templates:** Django uses template syntax to display dynamic data.

   ```html
   <!--templates\appname\home.html-->
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />

       <title>{{ page_title }}</title>
     </head>
     <body>
       <h1>{{ message }}</h1>

       <p>My first Django application is working!</p>
     </body>
   </html>
   ```

   1. **Create a shared base template:** Create `templates/base.html`

      ```html
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{% block title %}My Django Project{% endblock %}</title>
        </head>
        <body>
          <header>
            <h1>My Django Project</h1>
          </header>
          <main>{% block content %}{% endblock %}</main>
          <footer>
            <p>Copyright My Django Project</p>
          </footer>
        </body>
      </html>
      ```

   2. **Extend the base template:** Update `templates/appname/home.html`, so individual application templates can reuse the shared layout.

      ```html
      {% extends "base.html" %} {% block title %} {{ page_title }} {% endblock
      %} {% block content %}
      <h2>Articles</h2>
      {% for article in articles %}
      <article>
        <h3>{{ article.title }}</h3>
        <p>{{ article.content }}</p>
        <small> Published: {{ article.created_at }} </small>
      </article>
      {% empty %}
      <p>No articles available yet.</p>
      {% endfor %} {% endblock %}
      ```

10. **Configure URL mapping for app:** Create `appname/url.py`

    ```python
    # appname/url.py
    from django.urls import path
    from . import views

    urlpatterns = [
        path('', views.home, name='home'),
    ]
    ```

11. **Connect app URLs to the main project:** open `project_name/urls.py`

    ```python
    # project_name/urls.py
    from django.contrib import admin
    from django.urls import path, include

    urlpatterns = [
        path('admin/', admin.site.urls),
        path('', include('core.urls')),
        # Create additional apps
        path('users/', include('users.urls')),
        path('products/', include('products.urls')),
        path('orders/', include('orders.urls')),
    ]
    ```

12. **Run and test application:** start the development server

    ```bash
    python manage.py runserver
    ```

## Connections & Cross-References

[[../django-6-the-big-picture/00-django-6-the-big-picture-synthesis|Django 6: The Big Picture]]
