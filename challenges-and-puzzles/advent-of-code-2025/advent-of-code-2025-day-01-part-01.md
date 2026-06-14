---
aliases:
  - Advent of Code 2025 Day 01 Part 1
authors: matt2ology
categories:
  - coding-challenges
date: 2026-06-12T21:52:09-07:00
draft: false
math: true
slug: advent-of-code-2025-day-01-part-1
tags:
title: Advent of Code 2025 Day 01 Part 1
---

<!-- A coding challenge is about solving a problem (you → solution) -->

**Link:** <https://adventofcode.com/2025/day/1>

## Challenge

Pointing at a fixed starting position (`50`) in a wrap around
linear sequence (from `0` to `99`). Count the number of times the pointer
lands on the number zero (`0`).

## Pattern / Concept Takeaway

Circular array simulation / state tracking

## Insight

<!--
One idea only:
> What was the key thing that made it solvable?
Focus on the unlock, not the full solution.
That “Ohhh” moment
-->

The formula:

$$
\text{New Position} = \left( \left( \text{Current Position} + \text{Rotation} \right) \bmod 100 \right)
$$

The strategy:

    BEGIN
        Read a list of dial rotation instructions from a file.
        Set the dial to its starting position.
        Set the counter to zero.
        FOR each instruction
            Determine the direction of rotation.
            Determine how far to rotate the dial.
            Rotate the dial in the specified direction.
            IF the dial is pointing at zero THEN
                Increase the counter.
            END IF
        END FOR
        Return the total number of times the dial pointed at zero.
    END

### Core concept reminder: strings are iterable sequences

Reminder that strings are arrays, and sub-strings are still arrays

```python
print("1st element:", _data[0])
# ['L68', 'L30', 'R48', 'L5', 'R60', 'L55', 'L1', 'L99', 'R14', 'L82']
for combination in _data: # Example: Index 0 - Element 1
    _combination_direction: str = combination[0] # L
    _movement: int = int(combination[1:]) # 68
    print("DIRECTION:", _combination_direction, "MOVEMENT:", _movement)
    # DIRECTION: L MOVEMENT: 68)
```

### Simulation

> The dial starts by pointing at 50.

| **P**  |     |     |     |     |     |     |     |     |     |
| :----: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|   0    |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |  9  |
|   10   | 11  | 12  | 13  | 14  | 15  | 16  | 17  | 18  | 19  |
|   20   | 21  | 22  | 23  | 24  | 25  | 26  | 27  | 28  | 29  |
|   30   | 31  | 32  | 33  | 34  | 35  | 36  | 37  | 38  | 39  |
|   40   | 41  | 42  | 43  | 44  | 45  | 46  | 47  | 48  | 49  |
| **50** | 51  | 52  | 53  | 54  | 55  | 56  | 57  | 58  | 59  |
|   60   | 61  | 62  | 63  | 64  | 65  | 66  | 67  | 68  | 69  |
|   70   | 71  | 72  | 73  | 74  | 75  | 76  | 77  | 78  | 79  |
|   80   | 81  | 82  | 83  | 84  | 85  | 86  | 87  | 88  | 89  |
|   90   | 91  | 92  | 93  | 94  | 95  | 96  | 97  | 98  | 99  |

> The dial is rotated L68 to point at 82.

| **(Position + Rotation) % 10 = New Position** |     |     | **P**  |     |     |     |     |     |     |     |
| :-------------------------------------------: | :-: | :-: | :----: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|          $(0 + (-68)) \bmod 10 = 82$          |  0  |  1  |   2    |  3  |  4  |  5  |  6  |  7  |  8  |  9  |
|                                               | 10  | 11  |   12   | 13  | 14  | 15  | 16  | 17  | 18  | 19  |
|                                               | 20  | 21  |   22   | 23  | 24  | 25  | 26  | 27  | 28  | 29  |
|                                               | 30  | 31  |   32   | 33  | 34  | 35  | 36  | 37  | 38  | 39  |
|                                               | 40  | 41  |   42   | 43  | 44  | 45  | 46  | 47  | 48  | 49  |
|                                               | 50  | 51  |   52   | 53  | 54  | 55  | 56  | 57  | 58  | 59  |
|                                               | 60  | 61  |   62   | 63  | 64  | 65  | 66  | 67  | 68  | 69  |
|                                               | 70  | 71  |   72   | 73  | 74  | 75  | 76  | 77  | 78  | 79  |
|                                               | 80  | 81  | **82** | 83  | 84  | 85  | 86  | 87  | 88  | 89  |
|                                               | 90  | 91  |   92   | 93  | 94  | 95  | 96  | 97  | 98  | 99  |

> The dial is rotated L30 to point at 52.

| **(Position + Rotation) % 10 = New Position** |     |     | **P**  |     |     |     |     |     |     |     |
| :-------------------------------------------: | :-: | :-: | :----: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|          $(2 + (-30)) \bmod 10 = 52$          |  0  |  1  |   2    |  3  |  4  |  5  |  6  |  7  |  8  |  9  |
|                                               | 10  | 11  |   12   | 13  | 14  | 15  | 16  | 17  | 18  | 19  |
|                                               | 20  | 21  |   22   | 23  | 24  | 25  | 26  | 27  | 28  | 29  |
|                                               | 30  | 31  |   32   | 33  | 34  | 35  | 36  | 37  | 38  | 39  |
|                                               | 40  | 41  |   42   | 43  | 44  | 45  | 46  | 47  | 48  | 49  |
|                                               | 50  | 51  | **52** | 53  | 54  | 55  | 56  | 57  | 58  | 59  |
|                                               | 60  | 61  |   62   | 63  | 64  | 65  | 66  | 67  | 68  | 69  |
|                                               | 70  | 71  |   72   | 73  | 74  | 75  | 76  | 77  | 78  | 79  |
|                                               | 80  | 81  |   82   | 83  | 84  | 85  | 86  | 87  | 88  | 89  |
|                                               | 90  | 91  |   92   | 93  | 94  | 95  | 96  | 97  | 98  | 99  |

> The dial is rotated R48 to point at 0.
>
> Note: the dial points at 0 here, so we count this as 1 occurrence of landing on zero.

| **(Position + Rotation) % 10 = New Position** | **P** |     |     |     |     |     |     |     |     |     |
| :-------------------------------------------: | :---: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|           $(2 + (48)) \bmod 10 = 0$           | **0** |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |  9  |
|                                               |  10   | 11  | 12  | 13  | 14  | 15  | 16  | 17  | 18  | 19  |
|                                               |  20   | 21  | 22  | 23  | 24  | 25  | 26  | 27  | 28  | 29  |
|                                               |  30   | 31  | 32  | 33  | 34  | 35  | 36  | 37  | 38  | 39  |
|                                               |  40   | 41  | 42  | 43  | 44  | 45  | 46  | 47  | 48  | 49  |
|                                               |  50   | 51  | 52  | 53  | 54  | 55  | 56  | 57  | 58  | 59  |
|                                               |  60   | 61  | 62  | 63  | 64  | 65  | 66  | 67  | 68  | 69  |
|                                               |  70   | 71  | 72  | 73  | 74  | 75  | 76  | 77  | 78  | 79  |
|                                               |  80   | 81  | 82  | 83  | 84  | 85  | 86  | 87  | 88  | 89  |
|                                               |  90   | 91  | 92  | 93  | 94  | 95  | 96  | 97  | 98  | 99  |

> The dial is rotated L5 to point at 95.

| **(Position + Rotation) % 10 = New Position** |     |     |     |     |     | **P**  |     |     |     |     |
| :-------------------------------------------: | :-: | :-: | :-: | :-: | :-: | :----: | :-: | :-: | :-: | :-: |
|          $(0 + (-5)) \bmod 10 = 95$           |  0  |  1  |  2  |  3  |  4  |   5    |  6  |  7  |  8  |  9  |
|                                               | 10  | 11  | 12  | 13  | 14  |   15   | 16  | 17  | 18  | 19  |
|                                               | 20  | 21  | 22  | 23  | 24  |   25   | 26  | 27  | 28  | 29  |
|                                               | 30  | 31  | 32  | 33  | 34  |   35   | 36  | 37  | 38  | 39  |
|                                               | 40  | 41  | 42  | 43  | 44  |   45   | 46  | 47  | 48  | 49  |
|                                               | 50  | 51  | 52  | 53  | 54  |   55   | 56  | 57  | 58  | 59  |
|                                               | 60  | 61  | 62  | 63  | 64  |   65   | 66  | 67  | 68  | 69  |
|                                               | 70  | 71  | 72  | 73  | 74  |   75   | 76  | 77  | 78  | 79  |
|                                               | 80  | 81  | 82  | 83  | 84  |   85   | 86  | 87  | 88  | 89  |
|                                               | 90  | 91  | 92  | 93  | 94  | **95** | 96  | 97  | 98  | 99  |

> The dial is rotated R60 to point at 55.

| **(Position + Rotation) % 10 = New Position** |     |     |     |     |     | **P**  |     |     |     |     |
| :-------------------------------------------: | :-: | :-: | :-: | :-: | :-: | :----: | :-: | :-: | :-: | :-: |
|          $(5 + (60)) \bmod 10 = 55$           |  0  |  1  |  2  |  3  |  4  |   5    |  6  |  7  |  8  |  9  |
|                                               | 10  | 11  | 12  | 13  | 14  |   15   | 16  | 17  | 18  | 19  |
|                                               | 20  | 21  | 22  | 23  | 24  |   25   | 26  | 27  | 28  | 29  |
|                                               | 30  | 31  | 32  | 33  | 34  |   35   | 36  | 37  | 38  | 39  |
|                                               | 40  | 41  | 42  | 43  | 44  |   45   | 46  | 47  | 48  | 49  |
|                                               | 50  | 51  | 52  | 53  | 54  | **55** | 56  | 57  | 58  | 59  |
|                                               | 60  | 61  | 62  | 63  | 64  |   65   | 66  | 67  | 68  | 69  |
|                                               | 70  | 71  | 72  | 73  | 74  |   75   | 76  | 77  | 78  | 79  |
|                                               | 80  | 81  | 82  | 83  | 84  |   85   | 86  | 87  | 88  | 89  |
|                                               | 90  | 91  | 92  | 93  | 94  |   95   | 96  | 97  | 98  | 99  |

> The dial is rotated L55 to point at 0.
>
> Note: the dial points at 0 here, so we count this as 2 occurrences of landing on zero.

| **(Position + Rotation) % 10 = New Position** | **P** |     |     |     |     |     |     |     |     |     |
| :-------------------------------------------: | :---: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|          $(5 + (-55)) \bmod 10 = 0$           | **0** |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |  9  |
|                                               |  10   | 11  | 12  | 13  | 14  | 15  | 16  | 17  | 18  | 19  |
|                                               |  20   | 21  | 22  | 23  | 24  | 25  | 26  | 27  | 28  | 29  |
|                                               |  30   | 31  | 32  | 33  | 34  | 35  | 36  | 37  | 38  | 39  |
|                                               |  40   | 41  | 42  | 43  | 44  | 45  | 46  | 47  | 48  | 49  |
|                                               |  50   | 51  | 52  | 53  | 54  | 55  | 56  | 57  | 58  | 59  |
|                                               |  60   | 61  | 62  | 63  | 64  | 65  | 66  | 67  | 68  | 69  |
|                                               |  70   | 71  | 72  | 73  | 74  | 75  | 76  | 77  | 78  | 79  |
|                                               |  80   | 81  | 82  | 83  | 84  | 85  | 86  | 87  | 88  | 89  |
|                                               |  90   | 91  | 92  | 93  | 94  | 95  | 96  | 97  | 98  | 99  |

> The dial is rotated L1 to point at 99.

| **(Position + Rotation) % 10 = New Position** |     |     |     |     |     |     |     |     |     | **P**  |
| :-------------------------------------------: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :----: |
|          $(0 + (-1)) \bmod 10 = 99$           |  0  |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |   9    |
|                                               | 10  | 11  | 12  | 13  | 14  | 15  | 16  | 17  | 18  |   19   |
|                                               | 20  | 21  | 22  | 23  | 24  | 25  | 26  | 27  | 28  |   29   |
|                                               | 30  | 31  | 32  | 33  | 34  | 35  | 36  | 37  | 38  |   39   |
|                                               | 40  | 41  | 42  | 43  | 44  | 45  | 46  | 47  | 48  |   49   |
|                                               | 50  | 51  | 52  | 53  | 54  | 55  | 56  | 57  | 58  |   59   |
|                                               | 60  | 61  | 62  | 63  | 64  | 65  | 66  | 67  | 68  |   69   |
|                                               | 70  | 71  | 72  | 73  | 74  | 75  | 76  | 77  | 78  |   79   |
|                                               | 80  | 81  | 82  | 83  | 84  | 85  | 86  | 87  | 88  |   89   |
|                                               | 90  | 91  | 92  | 93  | 94  | 95  | 96  | 97  | 98  | **99** |

> The dial is rotated L99 to point at 0.
>
> Note: the dial points at 0 here, so we count this as 3 occurrences of landing on zero.

| **(Position + Rotation) % 10 = New Position** | **P** |     |     |     |     |     |     |     |     |     |
| :-------------------------------------------: | :---: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|          $(9 + (-99)) \bmod 10 = 0$           | **0** |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |  9  |
|                                               |  10   | 11  | 12  | 13  | 14  | 15  | 16  | 17  | 18  | 19  |
|                                               |  20   | 21  | 22  | 23  | 24  | 25  | 26  | 27  | 28  | 29  |
|                                               |  30   | 31  | 32  | 33  | 34  | 35  | 36  | 37  | 38  | 39  |
|                                               |  40   | 41  | 42  | 43  | 44  | 45  | 46  | 47  | 48  | 49  |
|                                               |  50   | 51  | 52  | 53  | 54  | 55  | 56  | 57  | 58  | 59  |
|                                               |  60   | 61  | 62  | 63  | 64  | 65  | 66  | 67  | 68  | 69  |
|                                               |  70   | 71  | 72  | 73  | 74  | 75  | 76  | 77  | 78  | 79  |
|                                               |  80   | 81  | 82  | 83  | 84  | 85  | 86  | 87  | 88  | 89  |
|                                               |  90   | 91  | 92  | 93  | 94  | 95  | 96  | 97  | 98  | 99  |

> The dial is rotated R14 to point at 14.

| **(Position + Rotation) % 10 = New Position** |     |     |     |     | **P**  |     |     |     |     |     |
| :-------------------------------------------: | :-: | :-: | :-: | :-: | :----: | :-: | :-: | :-: | :-: | :-: |
|          $(0 + (14)) \bmod 10 = 14$           |  0  |  1  |  2  |  3  |   4    |  5  |  6  |  7  |  8  |  9  |
|                                               | 10  | 11  | 12  | 13  | **14** | 15  | 16  | 17  | 18  | 19  |
|                                               | 20  | 21  | 22  | 23  |   24   | 25  | 26  | 27  | 28  | 29  |
|                                               | 30  | 31  | 32  | 33  |   34   | 35  | 36  | 37  | 38  | 39  |
|                                               | 40  | 41  | 42  | 43  |   44   | 45  | 46  | 47  | 48  | 49  |
|                                               | 50  | 51  | 52  | 53  |   54   | 55  | 56  | 57  | 58  | 59  |
|                                               | 60  | 61  | 62  | 63  |   64   | 65  | 66  | 67  | 68  | 69  |
|                                               | 70  | 71  | 72  | 73  |   74   | 75  | 76  | 77  | 78  | 79  |
|                                               | 80  | 81  | 82  | 83  |   84   | 85  | 86  | 87  | 88  | 89  |
|                                               | 90  | 91  | 92  | 93  |   94   | 95  | 96  | 97  | 98  | 99  |

> The dial is rotated L82 to point at 32.

| **(Position + Rotation) % 10 = New Position** |     |     | **P**  |     |     |     |     |     |     |     |
| :-------------------------------------------: | :-: | :-: | :----: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|          $(4 + (-82)) \bmod 10 = 32$          |  0  |  1  |   2    |  3  |  4  |  5  |  6  |  7  |  8  |  9  |
|                                               | 10  | 11  |   12   | 13  | 14  | 15  | 16  | 17  | 18  | 19  |
|                                               | 20  | 21  |   22   | 23  | 24  | 25  | 26  | 27  | 28  | 29  |
|                                               | 30  | 31  | **32** | 33  | 34  | 35  | 36  | 37  | 38  | 39  |
|                                               | 40  | 41  |   42   | 43  | 44  | 45  | 46  | 47  | 48  | 49  |
|                                               | 50  | 51  |   52   | 53  | 54  | 55  | 56  | 57  | 58  | 59  |
|                                               | 60  | 61  |   62   | 63  | 64  | 65  | 66  | 67  | 68  | 69  |
|                                               | 70  | 71  |   72   | 73  | 74  | 75  | 76  | 77  | 78  | 79  |
|                                               | 80  | 81  |   82   | 83  | 84  | 85  | 86  | 87  | 88  | 89  |
|                                               | 90  | 91  |   92   | 93  | 94  | 95  | 96  | 97  | 98  | 99  |

Because the **dial points at 0 a total of three times** during this process,
the password in this example is **`3`**.

## Pitfalls / Stuck

<!--
Only write this if you actually learned something
> What slowed me down or was confusing?
Optional: one thing you got wrong, struggled, slowed down with - where learning happens
-->

Thinking that the dial starts by pointing at 50.

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

can be simplified to modulo 10:

| **P** |     |     |     |     |     |     |     |     |     |
| :---: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|   0   |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |  9  |

I reduced the dial from a `0–99` range to a `0–9` range by
taking all values modulo 10 (i.e., keeping only the last digit).

This simplification, the original sequence of events:

- The dial is rotated L68 to point at 82
- The dial is rotated L30 to point at 52
- The dial is rotated R48 to point at 0
- The dial is rotated L5 to point at 95
- The dial is rotated R60 to point at 55

becomes:

- The dial is rotated L68 to point at 2
- The dial is rotated L30 to point at 2
- The dial is rotated R48 to point at 0
- The dial is rotated L5 to point at 5
- The dial is rotated R60 to point at 5

The correct state transition is:

$new\:position=\left(position\pm movement\right)\%\:100$

not modulo 10.

- The dial starts by pointing at 50
- The dial is rotated L68 to point at 82: $\left(50−68\right)mod100=82$

---

## Solution

The implementation:

```python
if __name__ == "__main__":
    data: list[str] = load_input_file("day01_input.txt")
    zero_counter: int = 0
    position: int = 50
    divisor: int = 100
    for combination in data:
        combination_direction: str = combination[0].lower()
        movement: int = int(combination[1:])
        if combination_direction == "l":
            position = (position + (-(movement))) % divisor
        if combination_direction == "r":
            position = (position + (movement)) % divisor

        print(f"The dial is rotated {combination} to point at {position}")
        if position == 0:
            zero_counter += 1
            print("\t+ Counter increased:", zero_counter)
        print()

    print("COUNTER:", zero_counter)
```
