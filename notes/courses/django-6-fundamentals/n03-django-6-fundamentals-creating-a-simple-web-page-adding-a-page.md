---
aliases: Notes on Django 6 Fundamentals - Creating a Simple Web Page - Adding a Page
title: Notes on Django 6 Fundamentals - Creating a Simple Web Page - Adding a Page
date: 2026-11-15T22:10:33-08:00
draft: false
slug: django-6-fundamentals-creating-a-simple-web-page-adding-a-page
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6 Fundamentals
module: Creating a Simple Web Page
lesson: Adding a Page
---

**Analysis:** [[03-django-6-fundamentals-creating-a-simple-web-page|Django 6 Fundamentals - Creating a Simple Web Page]]

## TL;DR (too long; didn't read)

> [!tldr] Adding a Page Summary
> After adding a Django app: `python manage.py startapp website`
>
> Inside your Django app's folder (e.g. **`project_name/django_app_folder/views.py`**)
>
> 1. Add a view function by writing a standard Python function (e.g. `def my_function()`)
> 2. `url.py` in the project settings folder (i.e. `my_project/my_project`) import the the view `from django_app_folder.views import view_function_name`
> 3. Append a path to your defined view function `path(arg1, arg2)` in the, Python List, `urlpatterns`
>    1. **arg1:** the URL
>    2. **arg2:** your actual view function

## Adding a Page

After doing the following listed below...

Do the following

```shell
python manage.py runserver
```

**and navigate to:** <http://127.0.0.1:8000/welcome.html>

### View Functions

In **`project_name/website/views.py`**

A view is a Django component that handles a request for a web page.

Here we define behavior, where when welcome page is visited the functions produces "Welcome to my project!"

```python
# project_name/website/views.py
from django.http import HttpResponse

def welcome(request):
    return HttpResponse("Welcome to my project!")
```

### Assign a URL

We need to assign a URL to our view function so that we can actually visit the web page.

In **`meeting_planner/meeting_planner/urls.py`** we add our view function to the URL mappings.

1. Import the view `from django_app_folder.views import view_function_name`
2. in the predefined Python List `urlpatterns` append `path(arg1, arg2)` where
   1. **arg1:** specifies the URL
   2. **arg2:** is the actual view function

So, when a user wants to visit the `welcome.html`, we want that to be handled by our view function, `welcome`.

```python
from django.contrib import admin
from django.urls import path, include

from website.views import welcome


urlpatterns = [
    path('admin/', admin.site.urls),
    path('welcome.html', welcome),
]
```

> [!attention] Unresolved Reference
> PyCharm may show red underlines and an “Unresolved reference” warning under imports
>
> Solution:
>
> 1. **Right-click the outer `project_name/` folder** (not the inner folder `project_name/project_name/` settings folder).
> 2. **Select** Mark Directory as **"Sources Root"**.
