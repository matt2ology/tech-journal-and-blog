/**
 * Serializes frontmatter property lines into a fenced frontmatter block.
 */

function serializeFrontmatter(properties) {
  return `---\n${properties.join("\n")}\n---`;
}

module.exports = { serializeFrontmatter };
