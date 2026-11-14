---
aliases: Notes on Django 6 - Structure of a Django Application - View Functions
title: Notes on Django 6 - Structure of a Django Application - View Functions
date: 2026-11-12T22:14:50-08:00
draft: false
slug: django-6-structure-of-a-django-application-view-functions
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: "Django 6: The Big Picture"
module: Structure of a Django Application
lesson: View Functions
---

**Analysis:** [[../../../analysis/courses/django-6-the-big-picture/03-django-6-structure-of-a-django-application|Django 6 - Structure of a Django Application]]

## TL;DR (too long; didn't read)

> [!tldr] View Functions Summary
>
> From database data to be shown in the browser.
> In the **views.py** file, view functions define what happens when one visits a certain page in the browser.
> View functions retrieve data from the database and pass it to templates for rendering.

## View Functions

In the **views.py** file contains "view functions", or "view", defines what happens when one visits a certain page in the browser

The following view defines what happens when the landing page is visited

```python
def landing_page(request):
    posts = Trip.objects.all()
    destinations = Destination.objects.values_list("country", flat=True).distinct()
    return render(
        request, "anding_page.html", {"posts": posts, "destinations": destinations}
    )
```

- **`Trip.objects.all()`:** grabs all trips from the database
  - Django, in the background, runs a SQL query to get the corresponding rows and transforms into Python objects
- **`Destination.objects.values_list("country", flat=True).distinct()`:** gives the country of each destination as a list with each distinct value listed once
- **`render()`:** sends the data to another component called a template to be rendered into an HTML page
