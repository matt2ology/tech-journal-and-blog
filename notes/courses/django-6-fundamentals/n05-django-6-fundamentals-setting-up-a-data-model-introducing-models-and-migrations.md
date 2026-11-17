---
aliases: Notes on Django 6 Fundamentals - Setting Up a Data Model - Introducing Models and Migrations
title: Notes on Django 6 Fundamentals - Setting Up a Data Model - Introducing Models and Migrations
date: 2026-11-16T22:49:05-08:00
draft: false
slug: django-6-fundamentals-setting-up-a-data-model-introducing-models-and-migrations
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6 Fundamentals
module: Setting up a Data Model
lesson: Introducing Models and Migrations
---

**Analysis:** [[../../../analysis/courses/django-6-fundamentals/04-django-6-fundamentals-setting-up-a-data-model|Django 6 Fundamentals - Setting Up a Data Model]]

## TL;DR (too long; didn't read)

> [!tldr] Introducing Models and Migrations Summary
> **Models** are Python classes that represent your data and make it possible to save your data in a database.
>
> **Migrations** are scripts that help keep your database structure up to date with your model classes.

## Introducing Models and Migrations

### Models

Models are Python classes, and their purpose is to make our data persistent.

1. Models are regular Python classes
2. In Django models represents objects with keys-values in a table to be stored in the Sqlite database
3. Each object is a, record, row in the table
4. Database structures can be updated via migrations

### Migrations

1. A migration is a **Python script** that changes the database so as to keep the structure of the database up to date with our model classes.
2. Keeps database structure in sync with code
3. Django will generate a migration script that will update the database table accordingly

> [!caution] Auto generate a migration script (but not always)
> Depending on the complexity of your Django project...
>
> Django will not be able to generate everything you need, and you'll need to write your own migration code.
