/**
 * Service to query vault metadata and frontmatter values.
 */
class VaultQueryService {
  /**
   * Fetches unique subfolder titles 1 level deep within a specific folder.
   *
   * @param {Object} options - { app, folderPath }
   * @returns {string[]} Array of unique subfolder titles
   */
  static getSubfolderNames({ app, folderPath }) {
    if (VaultQueryService.#isInvalidApp({ app })) return [];

    const cleanBasePath = folderPath.replace(/\\/g, "/").replace(/\/$/, "");
    const subfolders = new Set();

    app.vault.getAllLoadedFiles().forEach((file) => {
      const cleanFilePath = file.path.replace(/\\/g, "/");
      if (
        VaultQueryService.#isFileInBasePath({ cleanFilePath, cleanBasePath })
      ) {
        const relativePath = cleanFilePath.substring(cleanBasePath.length + 1);
        const parts = relativePath.split("/");
        if (VaultQueryService.#hasSubfolderParts({ parts })) {
          subfolders.add(parts[0]);
        }
      }
    });

    return Array.from(subfolders);
  }

  static #isFileInBasePath({ cleanFilePath, cleanBasePath }) {
    return cleanFilePath.startsWith(cleanBasePath + "/");
  }

  static #hasSubfolderParts({ parts }) {
    return parts.length > 1;
  }

  /**
   * Fetches unique field values from markdown frontmatter within a specific folder.
   *
   * @param {Object} options - { app, fieldName, folderPath }
   * @returns {string[]} Array of unique field values
   */
  static getFieldValues({ app, fieldName, folderPath }) {
    if (VaultQueryService.#isInvalidApp({ app })) return [];

    const files = VaultQueryService.#getMarkdownFilesInFolder({
      app,
      folderPath,
    });
    const values = new Set();

    files.forEach((file) => {
      const cache = app.metadataCache.getFileCache(file);
      if (VaultQueryService.#hasFrontmatterField({ cache, fieldName })) {
        VaultQueryService.#extractFieldValues({
          val: cache.frontmatter[fieldName],
          valuesSet: values,
        });
      }
    });

    return Array.from(values);
  }

  static #isInvalidApp({ app }) {
    return !Boolean(app && app.vault && app.metadataCache);
  }

  static #getMarkdownFilesInFolder({ app, folderPath }) {
    return app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith(folderPath));
  }

  static #hasFrontmatterField({ cache, fieldName }) {
    return Boolean(cache?.frontmatter && cache.frontmatter[fieldName]);
  }

  static #extractFieldValues({ val, valuesSet }) {
    if (VaultQueryService.#isArrayValue({ val })) {
      val.forEach((item) => {
        if (VaultQueryService.#isItemTruthy({ item })) valuesSet.add(item);
      });
    } else {
      valuesSet.add(val);
    }
  }

  static #isArrayValue({ val }) {
    return Array.isArray(val);
  }

  static #isItemTruthy({ item }) {
    return Boolean(item);
  }
}

module.exports = VaultQueryService;
