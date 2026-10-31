import { describe, test, expect } from "vitest";
import VaultQueryService from "../scripts/_quickadd/utils/vault-query-service.js";

describe("VaultQueryService", () => {
  const mockApp = {
    vault: {
      getAllLoadedFiles: () => [
        { path: "folder/sub1/note1.md" },
        { path: "folder/sub2/note2.md" },
        { path: "folder/sub1/note3.md" },
      ],
      getMarkdownFiles: () => [
        { path: "folder/note1.md" },
        { path: "folder/note2.md" },
      ],
    },
    metadataCache: {
      getFileCache: (file) => {
        if (file.path.includes("note1")) {
          return { frontmatter: { category: "tech" } };
        }
        return { frontmatter: { category: ["tech", "ai"] } };
      },
    },
  };

  test("fetches unique subfolder names 1 level deep", () => {
    const subfolders = VaultQueryService.getSubfolderNames({
      app: mockApp,
      folderPath: "folder",
    });
    expect(subfolders.sort()).toEqual(["sub1", "sub2"].sort());
  });

  test("fetches unique frontmatter field values including arrays", () => {
    const values = VaultQueryService.getFieldValues({
      app: mockApp,
      fieldName: "category",
      folderPath: "folder",
    });
    expect(values.sort()).toEqual(["tech", "ai"].sort());
  });
});
