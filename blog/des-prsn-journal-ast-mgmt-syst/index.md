---
aliases:
  - Designing a Personal Journal Asset Management System
authors: matt2ology
categories:
  - blog
date: 2026-04-11T14:31:38-07:00
draft: false
slug: designing-a-personal-journal-asset-management-system
tags:
title: Designing a Personal Journal Asset Management System
---

<!-- A blog is about communicating outward (you → readers) -->

Journaling, specifically my own modified form of [Bullet Journaling](https://bulletjournal.com/blogs/faq/how-to-start-a-bullet-journal-for-beginners?srsltid=AfmBOootADJHVwwDjgb0eLVqnuozYDWpdl3BZZGmmSRfkhdwf6WGNr-y), is a practice I’ve recently adopted to help me stay present, focused, and productive. A personal experiment: collecting data on my habits, identifying patterns, correcting behaviors, and adjusting course so I can become the person I want to be.

I started in 2024 with an A5 "Hobonichi Techo HON", switched to an A5 dot grid "MD Notebook" in 2025, and now plan to use the "Maruman Mnemosyne Journal" A5 dot grid exclusively.

With two notebooks already filled, my current journal covering January–April 2026 nearing completion, and a fourth set to begin from May through August, I want to create a system that treats all my past, current, and future notebooks as managed assets.

I want to invent my own personal library from scratch and learn new things along the way.

The system I want to design should have the following attributes:

- **Unique:** no duplicates, ever
- **Readable:** I can understand it without scanning
- **Short:** fits cleanly on a label
- **Structured:** conveys meaning (not just random numbers)
- **Scalable:** works when I have 10 or 1,000 journals

To create the asset tags, I’m using a Brother P-touch PT-D600 with the older P-touch Editor (v5.4.016). Unfortunately, Brother requires users to enter a device serial number to download the newer P-touch Editor 6.x. Despite multiple attempts to provide the correct serial, the system repeatedly returns a “Serial input error.” As a result, I’m continuing with the 2023 version of the software for now.

## Version 01: imposed structure for notebook/journal management

![[journal-asset-tag-version-01-094-layout-example.png|Journal Asset Tag Version 01 on 0.94 Tape]]

![[journal-asset-tag-version-01-047-layout-example.png|Journal Asset Tag Version 01 on 0.47 Tape]]

**LBX - Layout File:** [jrn-asset-tag-version-01.lbx](jrn-asset-tag-version-01.lbx)

The identifier should be modular similar to that of a "part number".

```md
JRN-[CATEGORY]-[YEAR]-[WEEK]
```

- **JRN** = Leading Classifier that it's a journal

For simplicity, the identifier will be encoded using **[Code 128](https://en.wikipedia.org/wiki/Code_128)** with human-readable characters displayed beneath the barcode (e.g. `JRN-PER-2024-01`). A QR code may be included as a backup.

### Category

Abbreviated category code:

- **CMN** = Commonplace Book - a repository of all my favorite quotes and insights
- **GYM** = Gym log and tracking of workouts
- **PER** = Personal journal, diary, log of life events or notes of the day
- **QCK** = Quick Capture / Every Day Carry Notebook / Fleeting Notes. A catch all - quick write down for short term memory, a note to later process and migrated into proper place in knowledge management
- **WRK** = A work journal, diary, log of work events or notes of the day

### Dates / Sequencing

Using date `Friday, February 9th, 2024` as an example:

- **YEAR:** `2024` = Four-digit year - based on the year of first entry
- **WEEK:** `06` = Two-digit week number - based on the week of the year of first entry
  - ⚠️ **Reminder:** there are 52 weeks in a year, so `64` is an invalid input

Examples:

- `JRN-CMN-2023-16` is a common place book with an entry in the 16th week of 2023
- `JRN-PER-2024-01` is a personal journal with an entry in the 1st week of 2024
- `JRN-QCK-2025-32` is a quick capture notebook (fleeting notes) with an entry in the 32nd week of 2025
- `JRN-WRK-2026-51` is a work journal with an entry in the 51st week of 2026

## Future (beyond notebook/journal management)

Applied at large is just an inventory management system

| ID          | Name               | Notes        |
| ----------- | ------------------ | ------------ |
| ELE-LAP-001 | MacBook Pro 14"    | Work machine |
| ACC-CHG-003 | USB-C Charger 65W  | Desk charger |
| CAM-LEN-002 | 50mm f/1.8 Lens    | Prime lens   |
| JRN-PHY-005 | 2024 Daily Journal | Shelf A      |

I'd like to build a lightweight system, similar to [Cheqroom](https://www.youtube.com/@Cheqroom), to label, manage, and track:

- **Asset Code:** Internal Unique ID
  - Uniquely identifies an item in database
  - Should **never change** once assigned
- **Asset Tag (Human-Readable Label):** physical or scannable representation attached to the item
  - Sticker with `JRN-RES-2026-07` printed on it
  - QR code that links to the item record
  - Add a Sequence to tag if multiple entries with same tag
- Title
- Status
- Location for storage

Example:

```md
Asset Code: J000182
Asset Tag: JRN-RES-2026-07
Title: AI Research Notes
Status: Active
Location: Shelf B2
```
