/**
 * Utilities for working with comma-separated values.
 */

function appendUniqueItem(list = "", item) {
  const items = new Set(
    String(list)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );

  if (item) items.add(item);
  return [...items].join(", ");
}

module.exports = { appendUniqueItem };
