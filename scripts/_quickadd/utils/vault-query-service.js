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
    if (!VaultQueryService.#isValidApp(app)) return [];

    const cleanBasePath = folderPath.replace(/\\/g, "/").replace(/\/$/, "");
    const subfolders = new Set();

    app.vault.getAllLoadedFiles().forEach((file) => {
      const cleanFilePath = file.path.replace(/\\/g, "/");
      if (cleanFilePath.startsWith(cleanBasePath + "/")) {
        const relativePath = cleanFilePath.substring(cleanBasePath.length + 1);
        const parts = relativePath.split("/");
        if (parts.length > 1) {
          subfolders.add(parts[0]);
        }
      }
    });

    return Array.from(subfolders);
  }

  /**
   * Fetches unique field values from markdown frontmatter within a specific folder.
   *
   * @param {Object} options - { app, fieldName, folderPath }
   * @returns {string[]} Array of unique field values
   */
  static getFieldValues({ app, fieldName, folderPath }) {
    if (!VaultQueryService.#isValidApp(app)) return [];

    const files = app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith(folderPath));
    const values = new Set();

    files.forEach((file) => {
      const cache = app.metadataCache.getFileCache(file);
      const fieldValue = cache?.frontmatter?.[fieldName];

      if (fieldValue) {
        if (Array.isArray(fieldValue)) {
          fieldValue.forEach((item) => {
            if (item) values.add(item);
          });
        } else {
          values.add(fieldValue);
        }
      }
    });

    return Array.from(values);
  }

  static #isValidApp(app) {
    return Boolean(app?.vault && app?.metadataCache);
  }
}

module.exports = VaultQueryService;
