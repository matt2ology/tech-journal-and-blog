---
aliases: Notes on Kotlin Fundamentals - Introduction to the Course - Introduction
title: Notes on Kotlin Fundamentals - Introduction to the Course - Introduction
date: 2026-11-18T00:10:35-08:00
draft: false
slug: kotlin-fundamentals-introduction-to-the-course-introduction
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[kevin-jones|Kevin Jones]]"
course: Kotlin Fundamentals
module: Introduction to the Course
lesson: Introduction
---

**Analysis:** [[02-kotlin-fundamentals-introduction-to-the-course|Kotlin Fundamentals - Introduction to the Course]]

## TL;DR (too long; didn't read)

> [!tldr] Introduction Summary
>
> 1. [Kotlin](https://github.com/JetBrains/intellij-community/releases) uses the Java Virtual Machine (JVM) language
>    - Works with Java (can use libraries written in Java and Java can use Kotlin libraries)
> 2. Kotlin is an object-oriented language
> 3. Kotlin treats functions as first class, so
>    - Functions can pass into other functions
>    - Return functions from other functions
>    - Functions can live alone as a top-level construct
> 4. Kotlin is a "low-ceremony language": strips away a lot of the verbosity and boilerplate of Java

## Introduction

1. Installation and introduction
2. Language Introduction and Features
3. Classes, interfaces and other types
4. Objects and Companions objects
5. Functions in Kotlin
6. Collections and sequences ("infinite streams")
7. Nullability (it's much harder to make errors with nulls in Kotlin)
8. Interoperate with Java

## What is Kotlin?

- Kotlin is a JVM (Java Virtual Machine) language
  - Compiles down to Java bytecode; as a result, interoperates with Java
  - Can use Java libraries
  - Can write libraries in Kotlin that can be called from Java code
- Is an object‑oriented language
- Kotlin was designed to have functional tendencies, so functions are treated as first class:
  - Can pass functions into other functions
  - Can return functions from functions
  - Functions can live alone as a top‑level construct (without wrapping inside a class, struct, or another function - like so in Python)
- Kotlin is also a [low ceremony language](https://martinfowler.com/dsl.html)
  - Stripped away the verbosity of Java
  - **EXAMPLE:** to define properties, we just define the type and the name of the property
    - Don't need getters, we don't need setters.
