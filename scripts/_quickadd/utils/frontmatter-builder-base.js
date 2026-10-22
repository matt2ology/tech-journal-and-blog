const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const { slugify, formatYAMLArray, titleCase } = require(
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
        defaultValue: "the title of a large book and it was returned on time",
      },
      {
        id: "tags",
        label: "Tags (comma separated)",
        type: "text",
        placeholder: "tag1, tag2",
        defaultValue: "",
      },
      {
        id: "categories",
        label: "Categories (comma separated)",
        type: "text",
        placeholder: "cat1, cat2",
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

  buildStandardProperties(values, computed) {
    return [
      `title: "${computed.title}"`,
      `date: "${computed.date}"`,
      `draft: ${computed.draft}`,
      `slug: "${computed.slug}"`,
      `tags:${computed.tags}`,
      `categories:${computed.categories}`,
    ];
  }

  buildExtraProperties() {
    return [];
  }

  appendToList(list = "", item) {
    return appendUniqueItem(list, item);
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

    this.#syncParamsVariables(params, computed, frontmatter);
    return frontmatter;
  }

  #computeStandardValues(values) {
    return {
      title: titleCase(values.title) || "",
      slug: slugify(values.title) || "",
      date: this.#quickAddApi.date.now("YYYY-MM-DD HH:mm:ss"),
      draft: true,
      tags: this.formatArray(values.tags),
      categories: this.formatArray(values.categories),
    };
  }

  #syncParamsVariables(params, computed, frontmatter) {
    if (!params?.variables) return;
    Object.assign(params.variables, computed, { frontmatter });
  }
}

module.exports = FrontmatterBuilderBase;
