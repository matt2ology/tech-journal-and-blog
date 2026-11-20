---
aliases: Notes on Django 6 Fundamentals - Setting Up a Data Model - Another Model
title: Notes on Django 6 Fundamentals - Setting Up a Data Model - Another Model
date: 2026-11-19T16:48:40-08:00
draft: false
slug: django-6-fundamentals-setting-up-a-data-model-another-model
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6 Fundamentals
module: Setting up a Data Model
lesson: Another Model
---

**Analysis:** [[../../../analysis/courses/django-6-fundamentals/04-django-6-fundamentals-setting-up-a-data-model|Django 6 Fundamentals - Setting Up a Data Model]]

## TL;DR (too long; didn't read)

> [!tldr] Another Model (Django Models and ForeignKey Relationships) Summary
>
> 1. **Room model:** Stores room information, including name, floor, and room number.
> 2. **Meeting model:** Stores meeting details, including title, date, start time, duration, and associated room.
> 3. **ForeignKey relationship:** `ForeignKey(Room, on_delete=models.CASCADE)` links each meeting to a specific room.
> 4. **`on_delete=models.CASCADE`:** Automatically deletes associated meetings when their related room is deleted.
> 5. **Required argument:** Django requires an `on_delete` behavior whenever defining a `ForeignKey`.
> 6. **Database migrations:** When models change, Django migrations are needed to handle existing database records and schema changes.
> 7. **Resetting migrations:** In development, you can delete the database and migration files and recreate them if necessary. Warning: This deletes existing data.
> 8. **Production caution:** Never casually delete migrations or databases in production, as this can result in permanent data loss.
> 9. **Superuser:** If you delete and recreate the database, you will also need to create a new superuser.
> 10. **Django Admin:** Register models in `admin.py` to manage them through the admin interface

## Another Model

```python
class Room(models.Model):
    name = models.CharField(max_length=50)
    floor = models. IntegerField()
    room_number = models. IntegerField()

    def __ str __ (self):
        return f"{self.name}: room {self.room_number} on floor {self.floor}"

class Meeting(models.Model):
    title = models.CharField(max_length=200)
    date = models.DateField()
    start_time = models.TimeField(default=time(9))
    duration = models.IntegerField(default=1)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)

    def _str __ (self):
        return f"{self.title} at {self.start_time} on {self.date}"
```

Here we define another model, `Meeting`, which has a foreign key relationship to the `Room` model. This allows us to associate meetings with specific rooms.

```python
ForeignKey(Room, on_delete=models.CASCADE)
```

The first argument to `ForeignKey` is the model that the relationship is to (i.e., `Room`), and the second argument is the `on_delete` behavior, which specifies what should happen to the related `Meeting` instances when a `Room` instance is deleted.

We're not allowed to create a foreign key in Django without specifying the `on_delete` behavior

If previous entries have been made in the database with a model that has been updated, we need to update the fields to have new default values, or delete previous migrations in the `migrations` folder, delete the database, and re-run migrations. This is because Django needs to know how to handle existing data when the model changes.

The downside of deleting the database and migrations is that all previous data will be lost, so this should only be done in development environments, not in production.

You would also need to recreate the superuser.

> [!NOTE] Don't forget to add all models to `dejango_app_name\admin.py`
>
> ```python
> # meetings\admin.py
> from django.contrib import admin
> from .models import Room, Meeting
>
> admin.site.register(Room)
> admin.site.register(Meeting)
> ```

So, by adding one line to our model, `ForeignKey(Room, on_delete=models.CASCADE)`, the admin interface gives us a very convenient way to create model data and link those objects together.
