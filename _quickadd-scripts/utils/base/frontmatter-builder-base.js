const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const TextFormatter = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "text-formatter"),
);
const ListUtils = require(
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
 * Coordinates the shared frontmatter workflow using OOP design principles.
 */
class FrontmatterBuilderBase {
  #quickAddApi;

  constructor(quickAddApi) {
    if (FrontmatterBuilderBase.#hasInvalidQuickAddApi({ quickAddApi })) {
      throw new TypeError(
        "FrontmatterBuilderBase requires a QuickAdd API instance with requestInputs().",
      );
    }
    this.#quickAddApi = quickAddApi;
  }

  static #hasInvalidQuickAddApi({ quickAddApi }) {
    return !Boolean(
      quickAddApi && typeof quickAddApi.requestInputs === "function",
    );
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
    return TextFormatter.formatYAMLArray({ input });
  }

  formatNameList(input, fallback) {
    return TextFormatter.formatYAMLNameList({ input, fallback });
  }

  buildStandardProperties({ computed }) {
    return [
      `aliases: ${computed.aliases}`,
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

  /**
   * Appends items to an existing list without duplicates using ListUtils.
   */
  appendToList({ list = "", items = [] }) {
    return ListUtils.appendUniqueItems({ list, item: items });
  }

  static parseCommaSeparatedList(input = "") {
    return TextFormatter.parseCommaSeparatedList(input);
  }

  static parseAndSlugifyCommaSeparatedList(input = "") {
    return TextFormatter.parseAndSlugifyCommaSeparatedList(input);
  }

  async run(params) {
    const requestedValues = await this.#quickAddApi.requestInputs(
      this.getFields(),
    );
    const processedValues = this.processValues(requestedValues);
    const computedValues = this.#computeStandardValues(processedValues);

    const properties = [
      ...this.buildStandardProperties({
        values: processedValues,
        computed: computedValues,
      }),
      ...this.buildExtraProperties({
        values: processedValues,
        computed: computedValues,
      }),
    ];

    const frontmatterString = serializeFrontmatter(properties);
    this.#syncExecutionVariables({
      params,
      computed: computedValues,
      values: processedValues,
      frontmatter: frontmatterString,
    });
    return frontmatterString;
  }

  #computeStandardValues(values) {
    return {
      aliases: values.aliases || "",
      title: TextFormatter.titleCase(values.title) || "NoTitle",
      slug: values.slug ?? TextFormatter.slugify(values.title),
      date: this.#quickAddApi.date.now("YYYY-MM-DD"),
      draft: true,
      categories: this.formatArray(values.categories),
      tags: this.formatArray(values.tags),
    };
  }

  #syncExecutionVariables({ params, computed, frontmatter, values }) {
    if (!params?.variables) return;
    Object.assign(params.variables, computed, values, { frontmatter });
  }
}

module.exports = FrontmatterBuilderBase;
