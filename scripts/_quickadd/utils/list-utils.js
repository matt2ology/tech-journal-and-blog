const TextFormatter = require("./text-formatter");

/**
 * Utilities for working with and modifying comma-separated lists.
 */
class ListUtils {
  /**
   * Appends unique item(s) to an existing comma-separated list string without duplicates.
   * @param {Object} options - Options.
   * @param {string} [options.list=""] - Existing comma-separated list string.
   * @param {string|string[]} options.item - Item or items to append.
   * @returns {string} Updated comma-separated list string.
   */
  static appendUniqueItems({ list = "", item }) {
    const existingItems = TextFormatter.parseCommaSeparatedList(list);
    const itemsToAppend = [item].flat(Infinity);
    const uniqueSet = new Set(existingItems);

    for (const rawItem of itemsToAppend) {
      if (rawItem) {
        const cleanedItem =
          typeof rawItem === "string"
            ? rawItem.trim().replace(/^and\s+/i, "")
            : rawItem;
        if (cleanedItem && String(cleanedItem).toLowerCase() !== "and") {
          uniqueSet.add(cleanedItem);
        }
      }
    }

    return [...uniqueSet].join(", ");
  }
}

module.exports = ListUtils;
