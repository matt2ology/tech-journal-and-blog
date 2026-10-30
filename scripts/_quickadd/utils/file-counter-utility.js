/**
 * Utility for counting files in a folder and returning a zero-padded string.
 */
class FileCounterUtility {
  /**
   * Returns the zero-padded count of markdown files in the specified folder.
   * @param {Object} params - The parameters.
   * @param {Object} params.app - The Obsidian app instance.
   * @param {string} params.folderPath - The target folder path.
   * @param {boolean} [params.includeNext=false] - Whether to increment the count for a new file index.
   * @returns {string} The zero-padded count (e.g., "01", "05").
   */
  static getCount({ app, folderPath, includeNext = false }) {
    if (!app || !folderPath) return "00";

    const fileCount = app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith(folderPath)).length;

    const count = includeNext ? fileCount + 1 : fileCount;

    return String(count).padStart(2, "0");
  }
}

module.exports = FileCounterUtility;
