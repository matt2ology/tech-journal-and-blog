---
aliases: Notes on Kotlin Fundamentals - Introduction to the Course - Using the Command Line
title: Notes on Kotlin Fundamentals - Introduction to the Course - Using the Command Line
date: 2026-11-18T01:01:45-08:00
draft: false
slug: kotlin-fundamentals-introduction-to-the-course-using-the-command-line
categories:
  - notes
tags: []
type: notes
domain: courses
instructor:
  - "[[kevin-jones|Kevin Jones]]"
course: Kotlin Fundamentals
module: Introduction to the Course
lesson: Using the Command Line
---

**Analysis:** [[02-kotlin-fundamentals-introduction-to-the-course|Kotlin Fundamentals - Introduction to the Course]]

## TL;DR (too long; didn't read)

> [!tldr] Using the Command Line Summary
>
> 1. **Open the Kotlin REPL:** `kotlinc`
> 2. **Exit the Kotlin REPL:** `:quit`
> 3. [Define functions with: `fun` keyword](https://kotlinlang.org/docs/basic-syntax.html#functions), with [`main()` serving as the program's entry point](https://kotlinlang.org/docs/basic-syntax.html#program-entry-point)
> 4. Compile Kotlin source files using `kotlinc Filename.kt`, which generates JVM bytecode in the form of class files.
> 5. Compile Java executable: `kotlinc Filename.kt -include-runtime -d filename.jar`
> 6. Run Java executable `java -jar hello.jar`

## Using the Command Line

[Kotlin can be installed and used within the command-line](https://kotlinlang.org/docs/command-line.html)

From the command-line run

```shell
kotlinc
```

This will, like for Python, open a Read‑Evaluate‑Print-Loop (REPL), so can execute Kotlin commands

REPLs can be useful for just evaluating small snippets of code

To exit type:

```shell
:quit
```

> [!caution] Environment variables configuration required and troubleshooting
> From my experience even after installing the [IntelliJ Open Source community edition](https://github.com/JetBrains/intellij-community/releases), after rebooting, I still get prompted:
>
> "kotlinc : The term 'kotlinc' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again."
>
> It is after creating a project and using the IDE's intergrated terminal that the command `kotlinc` works
>
> 1.  Open IntelliJ IDEA
> 2.  Click **New Project**
> 3.  Select **Kotlin** from the left menu.

## Writing Functions and Code in Kotlin

In Kotlin, the way we define functions is with the fun keyword

```kotlin
// Hello.kt
fun main() {
    println("Hello, World)
}
```

## Compiling Code in Kotlin

Compile source code

```shell
kotlinc Hello.kt
```

Kotlin will produce a class file after compilation from "Hello.kt" -> `kotlinc` -> "Hellokt.class"

Even though we didn't define a class within our code, the JVM itself is class oriented, so everything has to live inside the class,

## Running Code in Kotlin

To run code we need to reference the Kotlin runtime JAR file

```shell
kotlinc Hello.kt -include-runtime -d hello.jar
```

This will compile a file for me again, but this time it will create a jar file called "hello.jar" and will include the Kotlin runtime

You'll see that the JAR file will be a larger file relative to the class file; for, the JAR contains all the necessary Kotlin code needed to execute

Because the JAR file contains all the code to execute, makes distribution easier, and can run anywhere that has a Java runtime environment by simply typing

```shell
java -jar hello.jar
```
