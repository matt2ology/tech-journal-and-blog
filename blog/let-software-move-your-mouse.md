---
aliases:
  - Let Software Move Your Mouse
authors: matt2ology
categories:
  - blog
date: 2026-04-28T09:24:36-07:00
draft: false
slug: let-software-move-your-mouse
tags:
title: Let Software Move Your Mouse
---

<!-- A blog is about communicating outward (you → readers) -->
A colleague recommended a [Mouse Jiggler with Adjustable Interval Timer](https://a.co/d/0iwfSZCI), but I already have a talent for wasting money; case in point, I’ve bought [Final Fantasy X](https://en.wikipedia.org/wiki/Final_Fantasy_X) across multiple console generations and platforms, only to play it for a few hours before getting distracted with other endeavors...

Greg this is for you ✨

## Prerequisite

1. Have python installed: <https://www.python.org/downloads/>
    1. Check installation: `python --version`
2. Install dependencies
    1. [PyAutoGUI](https://pypi.org/project/PyAutoGUI/)
    2. [keyboard](https://pypi.org/project/keyboard/)

```sh
python.exe -m pip install --upgrade pip
pip install PyAutoGUI
pip install keyboard
```

## The code

Save the following code as `main.py` or whatever.

To run type the following:

```
py .\main.py
```

Features:

- Mouse + keyboard activity detection
- Ignores its own, automated, movements
- Clean config (no magic numbers)
- Logging for both activity types

```python
import pyautogui
import random
import time
import math
import keyboard
from dataclasses import dataclass


@dataclass(frozen=True)
class Config:
    check_interval_seconds: float = 5.0
    idle_threshold_seconds: float = 10.0
    # maximum random offset in pixels for each movement
    movement_range_pixels: int = 100
    movement_duration_seconds: float = 0.2
    # False positives adjustment
    # minimum distance to consider as user activity
    activity_distance_threshold: float = 110.0
    # ignore movement after automation
    ignore_after_move_seconds: float = 1.0
    enable_logging: bool = True


CONFIG = Config()

last_position = pyautogui.position()
last_activity_time = time.time()
last_automation_time = 0.0
was_idle = False


def log(message: str):
    if CONFIG.enable_logging:
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")


def get_distance(p1, p2):
    return math.hypot(p1[0] - p2[0], p1[1] - p2[1])


def generate_offset(range_pixels):
    return (
        random.randint(-range_pixels, range_pixels),
        random.randint(-range_pixels, range_pixels),
    )


def nudge_mouse():
    global last_automation_time

    current_x, current_y = pyautogui.position()
    dx, dy = generate_offset(CONFIG.movement_range_pixels)

    log(f"Automation moving mouse by offset ({dx}, {dy})")

    pyautogui.moveTo(
        current_x + dx,
        current_y + dy,
        duration=CONFIG.movement_duration_seconds
    )

    last_automation_time = time.time()

# Keyboard event handler


def on_key_event(event):
    global last_activity_time, was_idle

    last_activity_time = time.time()

    if was_idle:
        log("Keyboard activity detected — pausing automation")

    was_idle = False


keyboard.on_press(on_key_event)

print("Mouse + keyboard aware mover running. Press Ctrl+C to stop.")

try:
    while True:
        current_time = time.time()
        current_position = pyautogui.position()

        distance_moved = get_distance(current_position, last_position)

        recently_automated = (
            current_time - last_automation_time
            < CONFIG.ignore_after_move_seconds
        )

        # Mouse activity detection
        if distance_moved > CONFIG.activity_distance_threshold and not recently_automated:
            last_activity_time = current_time

            if was_idle:
                log("Mouse activity detected — pausing automation")

            was_idle = False

        last_position = current_position

        idle_time = current_time - last_activity_time

        if idle_time >= CONFIG.idle_threshold_seconds:
            if not was_idle:
                log("User inactive — automation resumed")

            was_idle = True
            nudge_mouse()

        time.sleep(CONFIG.check_interval_seconds)

except KeyboardInterrupt:
    print("Stopped.")
```
