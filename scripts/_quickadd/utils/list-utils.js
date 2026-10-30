const TextFormatter = require("./text-formatter");

/**
 * Utilities for working with comma-separated lists.
 */
class ListUtils {
  static appendUniqueItem({ list = "", item }) {
    const items = new Set(TextFormatter.parseCommaSeparatedList(list));

    if (ListUtils.#isValidItem({ item })) {
      const cleanedItem =
        typeof item === "string" ? item.trim().replace(/^and\s+/i, "") : item;
      if (cleanedItem && String(cleanedItem).toLowerCase() !== "and") {
        items.add(cleanedItem);
      }
    }
    return [...items].join(", ");
  }

  static #isValidItem({ item }) {
    return Boolean(item);
  }
}

module.exports = ListUtils;
