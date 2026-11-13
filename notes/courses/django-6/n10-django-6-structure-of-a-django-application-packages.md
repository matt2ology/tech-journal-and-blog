---
aliases: Notes on Django 6 - Structure of a Django Application - Packages
title: Notes on Django 6 - Structure of a Django Application - Packages
date: 2026-11-13T15:06:19-08:00
draft: false
slug: django-6-structure-of-a-django-application-packages
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[reindert-jan-ekker|Reindert-Jan Ekker]]"
course: Django 6
module: Structure of a Django Application
lesson: Packages
---

**Analysis:** [[03-django-6-structure-of-a-django-application|Django 6 - Structure of a Django Application]]

## TL;DR (too long; didn't read)

> [!tldr] Packages Summary
>
> If you need additional features there is most likely a package for the desired feature.
> The `settings.py` needs to be updated when installing 3rd [party packages](https://djangopackages.org/)

## Packages

There may be specific features you'd like, but isn't included by default by Django.

[Django packages](https://djangopackages.org/) lists all packages one can add for 3rd party support (i.e. dependencies).

The instructor, Reindert-Jan Ekker, uses Tailwind CSS, so uses [crispy-tailwind](https://djangopackages.org/packages/p/crispy-tailwind/) [[n09-django-6-structure-of-a-django-application-user-input-with-forms#User Input with Forms|to style his HTML forms]].
