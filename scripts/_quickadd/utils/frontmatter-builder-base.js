const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const { slugify, formatYAMLArray, titleCase, formatYAMLNameList } = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "formatters"),
);
const { appendUniqueItem } = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "list-utils"),
);
const { serializeFrontmatter } = require(
  path.join(
    vaultPath,
    "scripts",
    "_quickadd",
    "utils",
    "frontmatter-serializer",
  ),
);

/**
 * Coordinates the shared frontmatter workflow.
 * Subclasses customize fields, value processing, and extra properties.
 */
class FrontmatterBuilderBase {
  #quickAddApi;

  constructor(quickAddApi) {
    if (!quickAddApi || typeof quickAddApi.requestInputs !== "function") {
      throw new TypeError(
        "FrontmatterBuilderBase requires a QuickAdd API with requestInputs().",
      );
    }
    this.#quickAddApi = quickAddApi;
  }

  getFields() {
    return [
      {
        id: "title",
        label: "Title",
        type: "text",
        placeholder: "Note Title",
        defaultValue: "",
      },
      {
        id: "categories",
        label: "Categories (comma separated)",
        type: "text",
        placeholder: "cat1, cat2",
        defaultValue: "",
      },
      {
        id: "tags",
        label: "Tags (comma separated)",
        type: "text",
        placeholder: "tag1, tag2",
        defaultValue: "",
      },
    ];
  }

  processValues(values) {
    return values;
  }

  formatArray(input) {
    return formatYAMLArray(input);
  }

  formatNameList(input, fallback) {
    return formatYAMLNameList(input, fallback);
  }

  buildStandardProperties(values, computed) {
    return [
      `title: "${computed.title}"`,
      `date: "${computed.date}"`,
      `draft: ${computed.draft}`,
      `slug: "${computed.slug}"`,
      `categories:${computed.categories}`,
      `tags:${computed.tags}`,
    ];
  }

  buildExtraProperties() {
    return [];
  }

  appendToList(list = "", item) {
    return appendUniqueItem(list, item);
  }

  /**
   * Parses a comma-separated string or array into a clean array of trimmed strings.
   * @param {string|string[]} input - The input to parse
   * @returns {string[]} Cleaned array of items
   */
  parseCommaSeparatedList(input) {
    if (Array.isArray(input)) {
      return input.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof input === "string") {
      return input
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }

  async run(params) {
    const requestedValues = await this.#quickAddApi.requestInputs(
      this.getFields(),
    );
    const values = this.processValues(requestedValues);
    const computed = this.#computeStandardValues(values);

    const properties = [
      ...this.buildStandardProperties(values, computed),
      ...this.buildExtraProperties(values, computed),
    ];

    const frontmatter = serializeFrontmatter(properties);
    this.#syncParamsVariables(params, computed, frontmatter, values);
    return frontmatter;
  }

  #computeStandardValues(values) {
    return {
      title: titleCase(values.title) || "NoTitle",
      slug: values.slug ?? slugify(values.title),
      date: this.#quickAddApi.date.now("YYYY-MM-DD"),
      draft: true,
      categories: this.formatArray(values.categories),
      tags: this.formatArray(values.tags),
    };
  }

  #syncParamsVariables(params, computed, frontmatter, values) {
    if (!params?.variables) return;
    Object.assign(params.variables, computed, values, { frontmatter });
  }
}

module.exports = FrontmatterBuilderBase;
