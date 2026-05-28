---
aliases: "Highlights of Ronald T. Kneusel - How AI Works"
authors: Ronald T. Kneusel
categories:
  - highlights
  - books
date: 2026-04-01
draft: true
media: books
source: kindle
tags:
title: "Highlights of Ronald T. Kneusel - How AI Works"
---

## How AI Works

![rw-book-cover|120](https://m.media-amazon.com/images/I/71NyABt9MdL._SY160.jpg)

Source published date: October 24, 2023

source: kindle

<!-- Line brake - br -->

- [ ] **Literature note:** [[../../literature/ronald-t-kneusel-how-ai-works]]

<!--
SQ3R Method (Survey, Question, Read, Recite, Review).
Best for: General study and reading comprehension. It’s a well-established method for extracting key information from texts.

1. **Survey:** Skim the chapter to get an overview by examining headings, visuals, and summaries.
2. **Question:** Turn headings and key parts into questions to guide your focus while reading.
3. **Read:** Read the material actively to find answers while noting key ideas.
4. **Recite:** Summarize or recall the information in your own words.
5. **Review:** Go back over the material periodically to reinforce the information.
 -->

## Preface

**Marginalia / Reflection:**
There are many books that teaches how to implement or inform you on artificial intelligence (AI), but few books that conceptually teaches how AI works without the complicated math.

> [!cite]
> Many books teach you how to do artificial intelligence (AI). Similarly, many popular books tell you about AI. However, what seems to be missing is a book that teaches you how AI works at a conceptual level. AI isn’t magic; you can understand what it’s doing without burying yourself in complex mathematics.
> \- Kneusel, Ronald T.. How AI Works: From Sorcery to Science (p. 1). No Starch Press. Kindle Edition. (Kneusel 1)

---

**Marginalia / Reflection:**
This book splits the divide of low-level details (being in the weeds with all the maths) and the bird’s-eye view abstraction of what the math is doing by explaining towards the middle - writing the conceptual process and procedures (the approach) that makes AI happen without the math and removed abstractions.

> [!cite]
> This book fills that void with a math-free explanation of how AI works. While some books are down in the weeds and others offer a bird’s-eye view, this book is at treetop level. It aims to provide you with enough detail to understand the approach without getting bogged down in nitty-gritty mathematics. If that piques your interest, I invite you to read on.
> \- Kneusel, Ronald T.. How AI Works: From Sorcery to Science (p. 1). No Starch Press. Kindle Edition. (Kneusel 1)

---

**Marginalia / Reflection:**
Throught out the text, the author will sprinkle in a shift in topic (adding personal elements of his own experience) or a tranistion from one point to another.

> [!cite]
> You’ll run across places where \***\* appears throughout the book. These markers highlight a shift in the topic or a transition point. In a textbook, \*\*** would indicate a new section, but this isn’t a textbook, nor do I want it to feel like one; so, instead of sections and subsections, I’ll use asterisks to warn you that a change is coming. Like this . . .
> \- Kneusel, Ronald T.. How AI Works: From Sorcery to Science (p. 1). No Starch Press. Kindle Edition. (Kneusel 1)

---

---

**Marginalia / Reflection:**
This book walks through the process and procedures of how artificial intelligence (AI) works without the Nitty-gritty of mathamatical functions and the high level abstractions in hopes to give reason and help the understanding of the math elements.

Although, a few aspects of artificial intelligence (AI) has changed since he was first exposed to it in an undergrad class - AI development aims to emulate human intelligence from machine.

> [!cite]
> I first learned about artificial intelligence in 1987, in an undergraduate course of the same name. What people typically mean by AI has changed somewhat over the intervening decades. Still, the goal remains the same: to mimic intelligent behavior in a machine.
> \- Kneusel, Ronald T.. How AI Works: From Sorcery to Science (pp. 1-2). No Starch Press. Kindle Edition. (Kneusel 1-2)

---

**Marginalia / Reflection:**
Previous generations and iterations of Artificial intelligence (AI) has mostly been utilized and reserved for large industry or research institutes. It is now with generative AI via large language models the technology has been quickly accessible though implementations the layperson can utilize.

The author provides contextual happenings as to what, when, why, and how the sequence of AI development happened; without, the deep maths and hype speak.

> [!cite]
> Why learn about AI now? This book answers that question by explaining what happened, when it happened, why it happened, and, most importantly, how it happened—all without hype or a single mathematical equation. Frankly, the reality behind the AI revolution is impressive enough; the hype is unnecessary.
> \- Kneusel, Ronald T.. How AI Works: From Sorcery to Science (p. 2). No Starch Press. Kindle Edition. (Kneusel 2)

---

**Marginalia / Reflection:**
AI re-introduced itself to the public’s eye in 2012 with AlexNet, Google’s R&D to detect cats on their YouTube platform via “AlexNet”.

Soon after AlexNet new developments in the AI field that proper academic publishing couldn’t keep up to the volume of new developments made presented at AI tech conferences.

> [!cite]
> After AlexNet, things changed quickly, as seemingly monthly some new AI-related “miracle” appeared in the academic literature, if not on the evening news. The only way to keep up was to attend conferences multiple times per year; waiting for results to appear in an academic journal was pointless, as the field was progressing too rapidly for the typically slow pace of academic publishing.
> \- Kneusel, Ronald T.. How AI Works: From Sorcery to Science (p. 2). No Starch Press. Kindle Edition. (Kneusel 2)

---

**Marginalia / Reflection:**
AI conferences exemplify new found interest in the domain and field as tech start-ups and industry leaders invest and host the events - also a means to headhunt for new or experienced talent.

As FANG companies (champions/leaders in technology companies) continue to buy out competitors, consolidate, and collect both public and private information of users and of the population the desire to make a product of that information is enticing to both company and shareholders.

> [!cite]
> AI runs on data, and these companies gobble up all the data we freely give them in exchange for their services.
> \- Kneusel, Ronald T.. How AI Works: From Sorcery to Science (p. 3). No Starch Press. Kindle Edition. (Kneusel 3)

## Chapter 1: And Away We Go: An AI Overview

**Marginalia / Reflection:**
In the 1950s John McCarthy coined "artificial intelligence" as the means to prompt a computer to output a behavior that emulates human intelligence.

> [!cite]
> Artificial intelligence attempts to coax a machine, typically a computer, to behave in ways humans judge to be intelligent. The phrase was coined in the 1950s by prominent computer scientist John McCarthy (1927–2011).
> \- Kneusel, Ronald T.. How AI Works: From Sorcery to Science (p. 5). (Function). Kindle Edition. (Kneusel 5)

---

**Marginalia / Reflection:**
An overview of artificial intelligence as a whole - Chapter 1, "AND AWAY WE GO: AN AI OVERVIEW", aims to strictly define, make connections, and delineate the two concepts: "machine learning" (with example) and "deep learning".

> [!cite]
> This chapter aims to clarify what AI is and its relationship to machine learning and deep learning, two terms you may have heard in recent years. We’ll dive in with an example of machine learning in action. Think of this chapter as an overview of AI as a whole. Later chapters will build on and review the concepts introduced here.
> \- Kneusel, Ronald T.. How AI Works: From Sorcery to Science (p. 5). (Function). Kindle Edition. (Kneusel 5)

## Chapter 2: Why Now? A History of AI

### Pre-1900

### 1900 to 1950

### 1950 to 1970

### 1980 to 1990

### 1990 to 2000

### 2000 to 2012

### 2012 to 2021

### 2021 to Now

### Speed

### Algorithm

### Data

## Chapter 3: Classical Models: Old-School Machine Learning

## Chapter 4: Neural Networks: Brain-Like AI

## Chapter 5: Convolutional Neural Networks: AI Learns to See

## Chapter 6: Generative AI: AI Gets Creative

## Chapter 7: Large Language Models: True AI at Last?

### GPT-4

### GPT3.5

### Bard

### GPT-4

### Bard

### 7 billion

### 13 billion

### 30 billion

## Chapter 8: Musings: The Implications of AI
