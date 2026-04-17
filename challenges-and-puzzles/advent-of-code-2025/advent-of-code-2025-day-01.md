---
aliases:
  - Advent of Code 2025 Day 01
authors: matt2ology
categories:
  - coding-challenges
date: 2026-04-14T21:52:09-07:00
draft: false
math: true
slug: advent-of-code-2025-day-01
tags:
title: Advent of Code 2025 Day 01
---

<!-- A coding challenge is about solving a problem (you → solution) -->

**Link:** <https://adventofcode.com/2025/day/1>

## Challenge

Pointing at a fixed starting position (`50`) in a wrap around
linear sequence (from `0` to `99`). Count the number of times the pointer
lands on the number zero (`0`).

## Insight

<!--
One idea only:
> What was the key thing that made it solvable?
Focus on the unlock, not the full solution.
That “Ohhh” moment
-->

A circular array can be represented as a 2D table with the pointer at the top
and the values from 0 to 99 filling the table. Each row represents a cycle of
10 values, and the pointer moves through these values based on the rotations.

| Pointer |     |     |     |     |     |     |     |     |     |
| :-----: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|    0    |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |  9  |
|   10    | 11  | 12  | 13  | 14  | 15  | 16  | 17  | 18  | 19  |
|   20    | 21  | 22  | 23  | 24  | 25  | 26  | 27  | 28  | 29  |
|   30    | 31  | 32  | 33  | 34  | 35  | 36  | 37  | 38  | 39  |
|   40    | 41  | 42  | 43  | 44  | 45  | 46  | 47  | 48  | 49  |
|   50    | 51  | 52  | 53  | 54  | 55  | 56  | 57  | 58  | 59  |
|   60    | 61  | 62  | 63  | 64  | 65  | 66  | 67  | 68  | 69  |
|   70    | 71  | 72  | 73  | 74  | 75  | 76  | 77  | 78  | 79  |
|   80    | 81  | 82  | 83  | 84  | 85  | 86  | 87  | 88  | 89  |
|   90    | 91  | 92  | 93  | 94  | 95  | 96  | 97  | 98  | 99  |

The input range from 0 to 99 can be simplified to 0 to 9 by taking modulo 10,
since the value at any pointer position depends only on its position modulo 10.
This works because the values repeat every 10 steps (0 through 9,
then cycling back to 0).

In other words, the value at a given position is equal to the position modulo 10.
For example, at position `52`, the value is `2`, since $52 \bmod 10 = 2$.

|     |     | Pointer |     |     |     |     |     |     |     |
| :-: | :-: | :-----: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|  0  |  1  |    2    |  3  |  4  |  5  |  6  |  7  |  8  |  9  |

Then given a series of rotations (`L`eft or `R`ight), we can simulate the movement
of the pointer `L` **is negative** (we subtract from the pointer's position)
and `R` **is positive** (we add to the pointer's position).
After each rotation, we check if the pointer lands on a position
where the value is zero (i.e., the pointer's position modulo 10 equals zero)
and count how many times this happens.

So, from position `2`, `L4` would move the pointer 4 positions to the left,
resulting in position `8` (since $2 - 4 = -2$ and $-2 \bmod 10 = 8$).
We would check if this position corresponds to a value of zero by taking modulo 10.

|     |     |     |     |     |     |     |     | Pointer |     |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-----: | :-: |
|  0  |  1  |  2  |  3  |  4  |  5  |  6  |  7  |    8    |  9  |

From position `8`, `R3` would move it to position `1`.
We would check if these positions correspond to a value of zero by taking modulo 10.

The formula for updating the pointer's position after a rotation is:

$$
\text{New Position} = \left( \left( \text{Current Position} + \text{Rotation} \right) \bmod 10 \right)
$$

### Simulation

> The dial starts by pointing at 50.

| **P** |     |     |     |     |     |     |     |     |     |
| :---: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|   0   |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |  9  |
|  10   | 11  | 12  | 13  | 14  | 15  | 16  | 17  | 18  | 19  |
|  20   | 21  | 22  | 23  | 24  | 25  | 26  | 27  | 28  | 29  |
|  30   | 31  | 32  | 33  | 34  | 35  | 36  | 37  | 38  | 39  |
|  40   | 41  | 42  | 43  | 44  | 45  | 46  | 47  | 48  | 49  |
|  50   | 51  | 52  | 53  | 54  | 55  | 56  | 57  | 58  | 59  |
|  60   | 61  | 62  | 63  | 64  | 65  | 66  | 67  | 68  | 69  |
|  70   | 71  | 72  | 73  | 74  | 75  | 76  | 77  | 78  | 79  |
|  80   | 81  | 82  | 83  | 84  | 85  | 86  | 87  | 88  | 89  |
|  90   | 91  | 92  | 93  | 94  | 95  | 96  | 97  | 98  | 99  |

Simplified to modulo 10:

| **P** |     |     |     |     |     |     |     |     |     |
| :---: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|   0   |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |  9  |

> The dial is rotated L68 to point at 82.

| **(Position + Rotation) % 10 = New Position** |     |     | **P** |     |     |     |     |     |     |     |
| :-------------------------------------------: | :-: | :-: | :---: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|          $(0 + (-68)) \bmod 10 = 2$           |  0  |  1  |   2   |  3  |  4  |  5  |  6  |  7  |  8  |  9  |

> The dial is rotated L30 to point at 52.

| **(Position + Rotation) % 10 = New Position** |     |     | **P** |     |     |     |     |     |     |     |
| :-------------------------------------------: | :-: | :-: | :---: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|          $(2 + (-30)) \bmod 10 = 2$           |  0  |  1  |   2   |  3  |  4  |  5  |  6  |  7  |  8  |  9  |

> The dial is rotated R48 to point at 0.
> Note: the dial points at 0 here, so we count this as 1 occurrence of landing on zero.

| **(Position + Rotation) % 10 = New Position** | **P** |     |     |     |     |     |     |     |     |     |
| :-------------------------------------------: | :---: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|           $(2 + (48)) \bmod 10 = 0$           |   0   |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |  9  |

> The dial is rotated L5 to point at 95.

| **(Position + Rotation) % 10 = New Position** |     |     |     |     |     | **P** |     |     |     |     |
| :-------------------------------------------: | :-: | :-: | :-: | :-: | :-: | :---: | :-: | :-: | :-: | :-: |
|           $(0 + (-5)) \bmod 10 = 5$           |  0  |  1  |  2  |  3  |  4  |   5   |  6  |  7  |  8  |  9  |

> The dial is rotated R60 to point at 55.

| **(Position + Rotation) % 10 = New Position** |     |     |     |     |     | **P** |     |     |     |     |
| :-------------------------------------------: | :-: | :-: | :-: | :-: | :-: | :---: | :-: | :-: | :-: | :-: |
|           $(5 + (60)) \bmod 10 = 5$           |  0  |  1  |  2  |  3  |  4  |   5   |  6  |  7  |  8  |  9  |

> The dial is rotated L55 to point at 0.
> Note: the dial points at 0 here, so we count this as 2 occurrences of landing on zero.

| **(Position + Rotation) % 10 = New Position** | **P** |     |     |     |     |     |     |     |     |     |
| :-------------------------------------------: | :---: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|          $(5 + (-55)) \bmod 10 = 0$           |   0   |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |  9  |

> The dial is rotated L1 to point at 99.

| **(Position + Rotation) % 10 = New Position** |     |     |     |     |     |     |     |     |     | **P** |
| :-------------------------------------------: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :---: |
|           $(0 + (-1)) \bmod 10 = 9$           |  0  |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |   9   |

> The dial is rotated L99 to point at 0.
> Note: the dial points at 0 here, so we count this as 3 occurrences of landing on zero.

| **(Position + Rotation) % 10 = New Position** | **P** |     |     |     |     |     |     |     |     |     |
| :-------------------------------------------: | :---: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|          $(9 + (-99)) \bmod 10 = 0$           |   0   |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |  9  |

> The dial is rotated R14 to point at 14.

| **(Position + Rotation) % 10 = New Position** |     |     |     |     | **P** |     |     |     |     |     |
| :-------------------------------------------: | :-: | :-: | :-: | :-: | :---: | :-: | :-: | :-: | :-: | :-: |
|           $(0 + (14)) \bmod 10 = 4$           |  0  |  1  |  2  |  3  |   4   |  5  |  6  |  7  |  8  |  9  |

> The dial is rotated L82 to point at 32.

| **(Position + Rotation) % 10 = New Position** |     |     | **P** |     |     |     |     |     |     |     |
| :-------------------------------------------: | :-: | :-: | :---: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|          $(4 + (-82)) \bmod 10 = 2$           |  0  |  1  |   2   |  3  |  4  |  5  |  6  |  7  |  8  |  9  |

Because the **dial points at 0 a total of three times** during this process,
the password in this example is **`3`**.

## Pitfalls / Stuck

<!--
Only write this if you actually learned something
> What slowed me down or was confusing?
Optional: one thing you got wrong, struggled, slowed down with - where learning happens
-->

## Pattern / Concept Takeaway

Circular array simulation / state tracking

---

## Solution
