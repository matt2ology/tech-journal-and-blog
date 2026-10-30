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
