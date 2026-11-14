---
aliases: Analysis of Django 6 - Structure of a Django Application - the Data Model Layer
title: Analysis of Django 6 - Structure of a Django Application - the Data Model Layer
date: 2026-11-12T14:25:30-08:00
draft: false
slug: django-6-structure-of-a-django-application
categories:
  - analysis
tags: []
type: analysis
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6
module: Structure of a Django Application
---

**Synthesis:** [[../../../synthesis/courses/django-6/00-django-6-the-big-picture-synthesis|Django 6: The Big Picture]]

<!-- Purpose: Transmute source materials (books, articles, podcasts, lecture notes) into active comprehension and extract candidate concepts. -->

## Key Takeaways & Core Concepts

<!-- A 2-3 sentence summary of the main argument or purpose in your own words. -->

> [!abstract] Executive Summary & Core Thesis
>
> 1. Django supports multiple databases, but **uses [SQLite](https://www.sqlite.org/) by default**
>    - MariaDB
>    - MySQL
>    - Oracle
>    - PostgreSQL
> 2. [[../../../notes/courses/django-6/n01-django-6-structure-of-a-django-application-the-data-model-layer#The Data Model Layer|The structure of the database tables reflects the structure of the Python classes]]
> 3. Support [[../../../notes/courses/django-6/n02-django-6-structure-of-a-django-application-database-migrations#Database Migrations|database migrations]] when a data table is updated with a new attribute via 2 commands:
>
>    ```shell
>    python manage.py makemigrations
>    python manage.py migrate
>    ```
>
> 4. Django [[../../../notes/courses/django-6/n03-django-6-structure-of-a-django-application-the-admin-interface#The Admin Interface|includes a robust admin interface]]
> 5. Django have [[n04-django-6-structure-of-a-django-application-view-functions|"view functions" (views for short) to pull data from the database to be shown in the browser]]
> 6. Django [[n05-django-6-structure-of-a-django-application-templates|uses "templates" to create HTML for the browser]]
> 7. **[[n06-django-6-structure-of-a-django-application-url-patterns|urls.py]]:** tell Django which URL page needs to be hosted
> 8. Django uses a [[n07-django-6-structure-of-a-django-application-the-model-template-view-architecture|"Model-Template-View" architecture]] where:
>    - **The Model (the data):** uses Python classes to represent tables in the database
>    - **Templates:** to generate HTML - presentation for user
>    - **View (the behavior):** brings everything together, map view functions fetch data to specific URLS, in `urls.py` for the templates to be displayed in HTML code via browser
> 9. The structure of a [[n08-django-6-structure-of-a-django-application-folder-structure-of-a-django-project|Django project directory]]
>    - Root folder is the Project folder
>    - The "main folder" contains settings and URLs
>    - "Apps" are subfunctions of the app project
> 10. Django have [[n09-django-6-structure-of-a-django-application-user-input-with-forms|robust intake-form models]]
> 11. Django have an [[n10-django-6-structure-of-a-django-application-packages|extensive, 3rd party, package ecosystem to expand functionality]]
