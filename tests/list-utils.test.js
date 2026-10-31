import { describe, test, expect } from "vitest";
import ListUtils from "../scripts/_quickadd/utils/list-utils.js";

describe("ListUtils", () => {
  test("appends unique items without duplicates", () => {
    const existing = "apple, banana";
    const result = ListUtils.appendUniqueItems({ list: existing, item: ["banana", "orange", "and pear"] });
    expect(result).toBe("apple, banana, orange, pear");
  });

  test("handles empty lists gracefully", () => {
    const result = ListUtils.appendUniqueItems({ list: "", item: "apple" });
    expect(result).toBe("apple");
  });
});