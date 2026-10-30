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
    if (FrontmatterBuilderBase.#isInvalidQuickAddApi({ quickAddApi })) {
      throw new TypeError(
        "FrontmatterBuilderBase requires a QuickAdd API with requestInputs().",
      );
    }
    this.#quickAddApi = quickAddApi;
  }

  static #isInvalidQuickAddApi({ quickAddApi }) {
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
      `aliases:${computed.aliases}`,
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
   * Combines the existing list and new items into a set for zero duplicates.
   */
  appendToList({ list = "", items = [] }) {
    const existingItems = TextFormatter.parseCommaSeparatedList(list);

    const newItemsInput = [items].flat(Infinity);
    const cleanedNewItems = newItemsInput
      .map((i) =>
        typeof i === "string" ? i.trim().replace(/^and\s+/i, "") : i,
      )
      .filter((i) => i && String(i).toLowerCase() !== "and");

    const uniqueSet = new Set([...existingItems, ...cleanedNewItems]);

    return FrontmatterBuilderBase.#serializeSetToList({ uniqueSet });
  }

  /**
   * Serializes the Set back into a clean string list format (contains exactly 1 if-statement).
   */
  static #serializeSetToList({ uniqueSet }) {
    const items = [...uniqueSet];
    if (items.length > 0) {
      return items.join(", ");
    }
    return "";
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
    const values = this.processValues(requestedValues);
    const computed = this.#computeStandardValues(values);

    const properties = [
      ...this.buildStandardProperties({ values, computed }),
      ...this.buildExtraProperties({ values, computed }),
    ];

    const frontmatter = serializeFrontmatter(properties);
    this.#syncParamsVariables({ params, computed, frontmatter, values });
    return frontmatter;
  }

  #computeStandardValues(values) {
    return {
      aliases: this.formatArray(TextFormatter.titleCase(values.aliases)) || "",
      title: TextFormatter.titleCase(values.title) || "NoTitle",
      slug: values.slug ?? TextFormatter.slugify(values.title),
      date: this.#quickAddApi.date.now("YYYY-MM-DD"),
      draft: true,
      categories: this.formatArray(values.categories),
      tags: this.formatArray(values.tags),
    };
  }

  #syncParamsVariables({ params, computed, frontmatter, values }) {
    if (!params?.variables) return;
    Object.assign(params.variables, computed, values, { frontmatter });
  }
}

module.exports = FrontmatterBuilderBase;
