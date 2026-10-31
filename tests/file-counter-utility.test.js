import { describe, test, expect } from "vitest";
import FileCounterUtility from "../scripts/_quickadd/utils/file-counter-utility.js";

describe("FileCounterUtility", () => {
  test("returns zero-padded count with increment", () => {
    const mockApp = {
      vault: {
        getMarkdownFiles: () => [
          { path: "notes/file1.md" },
          { path: "notes/file2.md" },
        ],
      },
    };

    const count = FileCounterUtility.getCount({
      app: mockApp,
      folderPath: "notes",
      includeNext: true,
    });

    expect(count).toBe("03");
  });

  test("returns default '00' when missing app or folderPath", () => {
    expect(
      FileCounterUtility.getCount({ app: null, folderPath: "notes" }),
    ).toBe("00");
  });
});
