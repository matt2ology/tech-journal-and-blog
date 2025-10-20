---
authors:
  - matt2ology
categories:
  - literature
date: 2025-10-14T12:52:18-07:00
draft: false
tags:
  - literature/video
title: Literature - unitycoin-clean-code-uncle-bob-lesson-6
---

## Literature note: unitycoin-clean-code-uncle-bob-lesson-6

Reference note: [unitycoin-clean-code-uncle-bob-lesson-6](../references/articles/unitycoin-clean-code-uncle-bob-lesson-6.md)

> **Summary:** Agile isn't about speed... It's about visibility. Agile replaces hope with data so teams can manage reality instead of wishful thinking; to clarify, Agile is a feedback system for managing uncertainty - not a process for going faster.

## Key Ideas

1. Agile's purpose: **get the bad news fast**, not to move faster. Shorter iterations - higher visibility resolution.
2. Every project balances the Iron Cross: good, fast, cheap, done - you can’t have all four.
3. **Velocity charts** and **burn-down charts** are the backbone of real Agile - no data, no management.
4. Quality drives speed: “You go fast by going well.”
5. Don't let a tool or process get in the way of getting impactful work done.
6. Large-scale Agile requires **many small Agile teams** working in parallel - not a single "Agile in the large" process.
7. Strong communication prevents waste, misalignment, and rework.

## Chapters

### [[../references/articles/unitycoin-clean-code-uncle-bob-lesson-6#How do you manage a software project?|#How do you manage a software project?]]

- Software project management is notoriously hard - often done "badly" or through "hope and prayer".
- Mismanagement leads to wrong products, low quality, missed deadlines, and burnout.
- The **Iron Cross** defines constraints: _good_, _fast_, _cheap_, _done_ - you can't have all four.
- Effective managers **adjust the knobs** (quality, cost, schedule, scope) using **frequent feedback** and short iteration cycles.
- **Agile** exists to improve feedback and communication, reducing guesswork.
  - The goal isn’t to hit a fixed plan - it's to steer toward the best achievable outcome.

### [[../references/articles/unitycoin-clean-code-uncle-bob-lesson-6#Finding the optimum solution - Data|Finding the optimum solution / Data]]

- **Data drives success**; without it, management is blind.
- Use metrics to manage toward the best achievable outcome across quality, cost, speed, and scope.
- Two key tools:
  - **Velocity Chart:** shows how much work is completed per week/iteration.
  - **Burn-down Chart:** shows how much work remains to reach the next major milestone.

- These visuals allow teams and managers to predict progress transparently.
- Requirements should **never freeze** - Agile welcomes change as understanding improves.
- **Estimates ≠ promises**; treat them as evolving signals.
- The goal of Agile: **produce reliable data early** so the team can _manage reality_.

### [[../references/articles/unitycoin-clean-code-uncle-bob-lesson-6#What is the first thing know about project - The Management Paradox.|What is the first thing know about project / The Management Paradox]]

- The **first thing known** in any project is _the date_, often fixed by business needs; however, **requirements are fluid** - customers refine what they want through iteration.
- Agile solves this by allowing requirements to evolve while maintaining time-boxed delivery.
- Teams continuously replan priorities, focusing on _core features first_ and pushing less-critical items to future iterations.
  - If every feature is “critical,” none of them are — **prioritize what matters**.
- Frequent show-and-tell sessions keep customer expectations aligned with progress.
  - Customers rarely know what they truly want until they see a working product.
  - Agile embraces this uncertainty by iterating quickly and showing progress often.

### [[../references/articles/unitycoin-clean-code-uncle-bob-lesson-6#The Waterfall Model|The Waterfall Model.]]

- Traditional Waterfall assumes phases (analysis, design, implementation) are sequential and "done".
- In reality, **analysis and design are continuous**, not binary.
- Software differs from physical engineering - it's adaptable and should evolve.
- Freezing requirements too early forces teams to "hack in" changes later, creating instability and technical debt.
- Waterfall often fails because it resists feedback and delays learning until it's too late.

### [[../references/articles/unitycoin-clean-code-uncle-bob-lesson-6#Iterative Development - Calculate Day|Iterative Development / Calculate Day.]]

- **"Runaway process inflation"** happens when teams respond to failure by adding _more process_ instead of _more feedback_.
- Iterative development starts with **Iteration 0** - capture lightweight requirements and draft user stories, leaving details to emerge over time.
  - Gather rough requirements and create simple user stories - refine later.
- Each iteration provides **real data** about progress, risks, and estimates.
- The focus shifts from predicting the future to learning as early as possible.

### [[../references/articles/unitycoin-clean-code-uncle-bob-lesson-6#The Control Knobs of project mgt|The Control Knobs of project mgt.]]

- The four adjustable controls:
  1. **Schedule**
  2. **Staff**
  3. **Quality**
  4. **Scope**

- **Adding people** rarely helps - it initially slows progress (Brooks's Law).
- **Lowering quality** for speed causes rework and collapse - "You go fast by going well".
- **Scope negotiation** is the manager's most powerful lever; trim deliverables to hit the date.
  - **Scope** is the most flexible lever; negotiate what must ship now vs. later.
- Developers hold the **data**, stakeholders hold the **authority** - in rational organizations, _data should win_.

### [[../references/articles/unitycoin-clean-code-uncle-bob-lesson-6#Short Cycles - Agile Software Development Practices - Extreme Programming|Short Cycles / Agile Software Development Practices / Extreme Programming.]]

- You can't fix all four constraints (scope, time, cost, quality); short cycles expose tradeoffs early.
- Agile's purpose: **get the bad news fast**, not to move faster.
- **Scrum without engineering discipline** (testing, refactoring, clean code) leads to _Flaccid Scrum_ - progress slows and quality decays.
  - **XP practices** (testing, refactoring, clean design) keep Scrum sustainable.
- Agile works best for **small, disciplined teams**.
- Large-scale Agile requires **many small Agile teams** working in parallel - not a single "Agile in the large" process.
- Avoid process theater - when tools (e.g., Jira) become more important than outcomes.
- **Relative estimation** (story points) enables better forecasting and ROI-based prioritization.
- Projects finish not when everything's done, but when **nothing valuable remains**.
- **Iterations never fail** - even zero progress yields data for better management.
- **Velocity stability** is the goal - steady, predictable output signals health.
  - **Stable velocity** signals health; erratic or declining trends indicate tech debt or pressure.

### [[../references/articles/unitycoin-clean-code-uncle-bob-lesson-6#Questions and Answers|Questions and Answers]]

- Writing extensive documentation often fails - _"nobody reads it"_. Favor visibility and communication instead.
- **Mentorship** is a senior engineer's responsibility; pairing with juniors accelerates growth for both.
  - _“The best way to learn something is to teach it”_ .
- **Business analysts** play a crucial role - they must translate between technical and business domains.
  - Effective analysts empathize with both the **customer's needs** and the **developer's challenges**.
  - Understand and communicate both customer intent and developer constraints.
- **Spikes** (research tasks) are valid stories - used to explore unknowns and improve estimation accuracy.
