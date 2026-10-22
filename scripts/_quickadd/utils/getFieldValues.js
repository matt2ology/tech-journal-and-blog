/**
 * Helper to fetch unique field values from markdown frontmatter within a specific folder.
 *
 * @param {Object} app - Obsidian App instance
 * @param {string} fieldName - The target frontmatter property key
 * @param {string} folderPath - The vault folder path to scan
 * @returns {string[]} Array of unique field values
 */
function getFieldValues(app, fieldName, folderPath) {
  if (!app || !app.vault || !app.metadataCache) return [];

  const files = app.vault
    .getMarkdownFiles()
    .filter((file) => file.path.startsWith(folderPath));

  const values = new Set();

  files.forEach((file) => {
    const cache = app.metadataCache.getFileCache(file);
    if (cache?.frontmatter && cache.frontmatter[fieldName]) {
      const val = cache.frontmatter[fieldName];
      if (Array.isArray(val)) {
        val.forEach((item) => {
          if (item) values.add(item);
        });
      } else {
        values.add(val);
      }
    }
  });

  return Array.from(values);
}

module.exports = { getFieldValues };
