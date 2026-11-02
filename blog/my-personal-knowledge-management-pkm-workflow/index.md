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

## 💡 Summary Overview

| **Stage**                  | **Note Type**                  | **Primary Function**                                  | **Source Dependency**                    | **Location / Directory** |
| -------------------------- | ------------------------------ | ----------------------------------------------------- | ---------------------------------------- | ------------------------ |
| **1. Capture**             | **Highlights & Live Outlines** | Quick, low-friction recording of raw inputs           | 🟢 **100% Source Dependent**             | `Readwise`, `capture`    |
| **2a. Analysis**           | **Chapter / Lecture**          | Deconstructing & analyzing individual parts           | 🟡 **High** (Linked to Synthesis Note)   | `analysis`               |
| **2b. Synthesis**          | **Book / Course**              | Combining parts into macro thesis & unified framework | 🟡 **Medium** (Linked to Analysis Notes) | `synthesis`              |
| **3. Network**             | **Atomic Concept Notes**       | Reusable mental models & declarative ideas            | 🔴 **Fully Decoupled**                   | `concepts`               |
| **4. Output** (_optional_) | **Projects & Writings**        | Essays, decision models, and deliverables             | 🔵 **Context-Specific**                  | `projects`               |

## 🗺️ The Process at a Glance

```mermaid
flowchart TD
    subgraph S1 [Stage 1: Raw Intake - High Source Dependency]
        A1([Media Highlights & Annotations])
        A2([Live Class & Seminar Capture])
    end

    subgraph S2 [Stage 2: Processing Hub]
        B1[Analysis Notes<br/>Chapters / Lectures]
        B2[Synthesis Notes<br/>Books / Courses]
    end

    subgraph S3 [Stage 3: Concept Network<br/>Fully Decoupled]
        C[Atomic Concept Notes<br/>Declarative Mental Models]
    end

    subgraph S4 [Stage 4: Creative Output]
        D1([Essays & Writing])
        D2([Projects & Work])
        D3([Problem Solving])
    end

    A1 -->|Import & Break Down| B1
    A2 -->|Review & Structure| B1
    B1 -->|Aggregate & Combine| B2
    B1 -->|Extract Ideas| C
    B2 -->|Extract Macro Models| C

    C -->|Assemble| D1
    C -->|Assemble| D2
    C -->|Assemble| D3
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

#### Declarative Mental Model

A **Declarative Mental Model** is a fundamental principle, law, or cognitive framework expressed as a concrete, self-contained statement of fact or claim (e.g., _"Friction is a stronger behavior lever than motivation"_ or _"Compounding effects dominate linear growth in complex systems"_), rather than a passive or generic topic label like _"Motivation"_ or _"Linear Growth"_.

In my personal knowledge management and systems thinking, framing mental models declaratively shifts notes from static bookmarking to active tools for thought.

##### Key Characteristics

- **Actionable & Testable:** Because it makes an explicit claim, a declarative statement can be evaluated, proven, applied to a problem, or refuted.
- **Context-Decoupled:** It strips away the original source (the specific author, book, or lecture where you encountered it) to focus purely on the underlying mechanic or universal truth.
- **Searchable & Associative:** When browsing or linking ideas, a declarative title immediately communicates _what the idea predicts or does_, making it easier to connect to unrelated disciplines.

##### Topic Labels vs. Declarative Mental Models

| **Domain**                | **Topic Label (Passive Archival)** | **Declarative Mental Model (Active Thinking)**                             |
| ------------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| **Behavioral Psychology** | Friction & Motivation              | _Friction is a stronger behavior lever than motivation._                   |
| **Systems Thinking**      | Feedback Loops                     | _Unchecked positive feedback loops eventually trigger systemic breakdown._ |
| **Economics / Finance**   | Opportunity Cost                   | _Every explicit commitment creates an implicit loss of option value._      |
| **Software Architecture** | System Complexity                  | _Interface complexity increases exponentially with state fragmentation._   |

### Stage 4: Output & Creation (_optional_)

- **Goal:** Retrieve and assemble networked concept notes into real-world deliverables.
- **Note Types:** Article outlines, research papers, project plans, decision logs, or presentations.
- **Key Characteristic:** Highly efficient creation. Rather than starting from scratch, projects are created by weaving together pre-existing, fully fleshed-out Concept Notes.
