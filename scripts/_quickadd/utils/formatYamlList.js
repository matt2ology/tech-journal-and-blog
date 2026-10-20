const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const { slugify } = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "slugify.js"),
);

/**
 * Format array or comma-separated string inputs into YAML-safe block-style lists.
 * @param {Array|string} val - Raw input value from QuickAdd
 * @returns {string} Formatted YAML list block
 */
module.exports = function formatYamlList(val) {
  if (!val) return "";

  const list = Array.isArray(val)
    ? val
    : val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  return list.map((item) => `\n  - "${slugify(item)}"`).join("");
};
