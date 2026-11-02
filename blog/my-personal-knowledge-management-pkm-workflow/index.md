---
aliases:
title: My Personal Knowledge Management (PKM) Workflow
date: 2026-11-01T19:34:59-08:00
draft: false
slug: my-personal-knowledge-management-pkm-workflow
categories:
  - blog
tags: []
---

My system adapts the [**Zettelkasten method**](https://en.wikipedia.org/wiki/Zettelkasten) to create a seamless pipeline from raw information intake to atomic, networked-linked thinking. Rather than relying on rigid traditional terms.

## 🗺️ The Process at a Glance

```mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
```

## 🔄 The 4-Stage Workflow

### Stage 1: Frictionless Capture

- **Goal:** Collect insights in real time without interrupting flow or overthinking structure.
- **Note Types:** Marginal notes, web quotes, book highlights (synced via Readwise), and rapid live lecture outlines.
- **Key Characteristic:** High source dependency, quick capture, zero organization required.

### Stage 2: Digest & Processing (Analysis vs. Synthesis)

- **Goal:** Active comprehension. Translate external knowledge into my own words before creating standalone concepts.
- **Architecture:** Uses a **Structural Separation** between breaking down parts and combining the whole:
  - **Analysis Notes (`analysis/`):** Breaking down individual granular parts (single chapters, specific lecture classes, individual podcast episodes, or standalone conference talks).
  - **Synthesis Notes (`synthesis/`):** Combining and summarizing the entire whole (full books, complete university courses, full podcast seasons/series, or entire multi-day conferences).
- **Key Feature:** Every analysis and synthesis note contains a **"Concept Candidates"** section, a staging ground for raw ideas waiting to be turned into permanent concept notes.

### Stage 3: Conceptualization

- **Goal:** Distill processed insights into permanent, reusable building blocks.
- **Note Types:**
  - **Concept Notes:** Decoupled, single-idea atomic notes written as **declarative titles** (e.g., `[[Friction is a stronger behavior lever than motivation]]`).
- **Key Principles:**
  - **Decoupled:** Completely independent of any specific author, book, or class.
  - **Atomic:** Focused on exactly one distinct idea or principle.
  - **Networked:** Hyperlinked to existing concept notes to form multi-disciplinary clusters.

### Stage 4: Output & Creation (_optional_)

- **Goal:** Retrieve and assemble networked concept notes into real-world deliverables.
- **Note Types:** Article outlines, research papers, project plans, decision logs, or presentations.
- **Key Characteristic:** Highly efficient creation. Rather than starting from scratch, projects are created by weaving together pre-existing, fully fleshed-out Concept Notes.

## 💡 Summary Overview

| **Stage**                  | **Note Type**                  | **Primary Function**                                  | **Source Dependency**                    | **Location / Directory** |
| -------------------------- | ------------------------------ | ----------------------------------------------------- | ---------------------------------------- | ------------------------ |
| **1. Capture**             | **Highlights & Live Outlines** | Quick, low-friction recording of raw inputs           | 🟢 **100% Source Dependent**             | `Readwise`, `capture`    |
| **2a. Analysis**           | **Chapter / Lecture**          | Deconstructing & analyzing individual parts           | 🟡 **High** (Linked to Synthesis Note)   | `analysis`               |
| **2b. Synthesis**          | **Book / Course**              | Combining parts into macro thesis & unified framework | 🟡 **Medium** (Linked to Analysis Notes) | `synthesis`              |
| **3. Network**             | **Atomic Concept Notes**       | Reusable mental models & declarative ideas            | 🔴 **Fully Decoupled**                   | `concepts`               |
| **4. Output** (_optional_) | **Projects & Writings**        | Essays, decision models, and deliverables             | 🔵 **Context-Specific**                  | `projects`               |
