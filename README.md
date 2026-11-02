# zettelkasten-obsidain-notes-to-hugo-template

[https://matt2ology.github.io/](https://matt2ology.github.io/)

https://www.atlasworkspace.ai/blog/zettelkasten-method-guide

Notes managed by Obsidian and transpiled to HTML via Hugo static site generator.

```mermaid
flowchart TD
    classDef stage1 fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#01579b;
    classDef stage2 fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#e65100;
    classDef stage3 fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#1b5e20;
    classDef stage4 fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c;

    subgraph S1 ["Stage 1: Raw Intake (High Source Dependency)"]
        A1[Media Highlights & Annotations]
        A2[Live Class & Seminar Capture]
    end

    subgraph S2 ["Stage 2: Processing Hub (Refinery)"]
        B1["Analysis Notes\n(Chapters / Lectures)"]
        B2["Synthesis Notes\n(Books / Courses)"]
    end

    subgraph S3 ["Stage 3: Concept Network (Fully Decoupled)"]
        C["Atomic Concept Notes\n(Declarative Mental Models)"]
    end

    subgraph S4 ["Stage 4: Creative Output"]
        D1[Essays & Writing]
        D2[Projects & Work]
        D3[Problem Solving]
    end

    A1 -->|Import & Break Down| B1
    A2 -->|Review & Structure| B1
    B1 -->|Aggregate & Combine| B2
    B1 -->|Extract Ideas| C
    B2 -->|Extract Macro Models| C

    C -->|Assemble| D1
    C -->|Assemble| D2
    C -->|Assemble| D3

    class A1,A2 stage1;
    class B1,B2 stage2;
    class C stage3;
    class D1,D2,D3 stage4;
```

## Setting up tests

### Install Vitest

Open the VS Code terminal and navigate to your vault directory.

```bash
npm init -y
npm install --save-dev vitest
```

Add this script to package.json:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

### Write a test

```javascript
import { describe, it, expect } from "vitest";
import TextFormatter from "../scripts/_quickadd/utils/text-formatter.js";

describe("TextFormatter.titleCase()", () => {
  it("capitalizes a single lowercase word", () => {
    expect(TextFormatter.titleCase("hello")).toBe("Hello");
  });

  it("capitalizes a single minor word", () => {
    expect(TextFormatter.titleCase("the")).toBe("The");
  });

  it("converts a sentence to title case", () => {
    expect(TextFormatter.titleCase("lord of the rings")).toBe(
      "Lord of the Rings",
    );
  });

  it("capitalizes the first word even when it is a minor word", () => {
    expect(TextFormatter.titleCase("the developer's guide to AI")).toBe(
      "The Developer's Guide to AI",
    );
  });

  it("preserves uppercase acronyms", () => {
    expect(TextFormatter.titleCase("artificial intelligence AI")).toBe(
      "Artificial Intelligence AI",
    );
  });

  it("handles empty strings", () => {
    expect(TextFormatter.titleCase("")).toBe("");
  });

  it("handles extra whitespace", () => {
    expect(TextFormatter.titleCase("  hello   world  ")).toBe("Hello World");
  });
});
```

### Run tests

In the VS Code terminal:

```bash
npm run test:run
```

To run tests automatically whenever you save a file:

```bash
npm test
```
