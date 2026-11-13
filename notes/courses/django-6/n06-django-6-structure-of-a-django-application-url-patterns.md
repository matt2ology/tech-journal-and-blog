---
aliases: "Notes on Django 6 - Structure of a Django Application - URL Patterns"
title: "Notes on Django 6 - Structure of a Django Application - URL Patterns"
date: 2026-11-12T23:46:32-08:00
draft: true
slug: django-6-structure-of-a-django-application-url-patterns
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: "Django 6"
module: "Structure of a Django Application"
lesson: "URL Patterns"
---

**Analysis:** [[03-django-6-structure-of-a-django-application|Django 6 - Structure of a Django Application]]

## TL;DR (too long; didn't read)

> [!tldr] URL Patterns Summary
>
> Django’s `urls.py` contains `urlpatterns`, a list that maps URL paths to their corresponding view functions, which handle loading the page’s information. URLs can also pass parameters, such as `<int:pk>` in `trips/<int:pk>`, which captures a number from the URL and passes it as an argument to the `detail_page` view.

## URL Patterns

**`urls.py`:** tell Django which URL page needs to be hosted

```python
urlpatterns = [
    path("admin/", admin.site.urls),
    path("", landing_page, name="landing"),
    path("trips/<int:pk>", detail_page, name="trip_detail"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

Variable `urlpatterns` holds a list of paths

- Where each line associates a URL to a view
  - **`"admin/", admin.site.urls`:** site admin is hosted at `/admin` URL
  - Landing page view is hosted at the empty URL (i.e. the default page)
    - The `landing_page` refers to the view function `landing_page` in views.py
  - `path(visiter_visits_at_url, will_call_view_function)`
    - The corresponding view function will then handle the loading of information for that page
- **`path("trips/<int:pk>", detail_page, name="trip_detail")`:**
  1. Start with `trips/`
  2. **`int:pk`:** expects a number
  3. View function, `detail_page`, is then called, but this time it takes the number form the URL as an argument
