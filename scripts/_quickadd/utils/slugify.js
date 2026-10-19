/**
 * Convert text into a URL-friendly slug.
 *
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
  return String(text ?? "") // Handle null or undefined
    .normalize("NFKD") // Normalize Unicode characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // Replace spaces, punctuation, etc.
    .replace(/-+/g, "-")       // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

module.exports = { slugify };

/* USAGE EXAMPLE if both files ARE in the same folder
const { slugify } = require("./slugify");

module.exports = async (params) => {
    const slug = slugify("Café au Lait & Other Stories");

    console.log(slug);
    // cafe-au-lait-other-stories
};
*/

/* USAGE EXAMPLE if both files ARE NOT in the same folder
const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const { slugify } = require(
    path.join(vaultPath, "Scripts", "slugify.js")
);


module.exports = async (params) => {
    const slug = slugify("Café au Lait & Other Stories");

    console.log(slug);
    // cafe-au-lait-other-stories
};
*/
