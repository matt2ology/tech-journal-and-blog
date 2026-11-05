/**
 * Dictionary of common abbreviations and their clean slug equivalents.
 */
const abbreviations = {
  "approx.": "approx",
  "e.g.": "eg",
  "etc.": "etc",
  "fig.": "fig",
  "i.e.": "ie",
  "no.": "no",
  "vs.": "vs",
};

// Safeguard check: Ensure no duplicate values or key collisions occur
const values = Object.values(abbreviations);
const uniqueValues = new Set(values);

if (values.length !== uniqueValues.size) {
  throw new Error(
    "Configuration Error: Duplicate values detected in common-abbreviations.js!",
  );
}

module.exports = Object.freeze(abbreviations);
