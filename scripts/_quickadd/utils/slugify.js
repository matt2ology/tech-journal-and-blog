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
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

module.exports = { slugify };
