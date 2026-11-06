const TextFormatter = require("../helpers/text-formatter");
const ListUtils = require("../helpers/list-utils");
const { serializeFrontmatter } = require("../helpers/frontmatter-serializer");

class FrontmatterBuilderBase {
  #quickAddApi;
  #fieldDefinitions;

  constructor(quickAddApi) {
    if (!quickAddApi || typeof quickAddApi.requestInputs !== "function") {
      throw new TypeError(
        "FrontmatterBuilderBase requires a QuickAdd API instance with requestInputs().",
      );
    }
    this.#quickAddApi = quickAddApi;
    this.#fieldDefinitions = Object.freeze([
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
    ]);
  }

  getFields() {
    return [...this.#fieldDefinitions];
  }

  addField(fieldDefinition) {
    this.#fieldDefinitions = Object.freeze([
      ...this.#fieldDefinitions,
      fieldDefinition,
    ]);
  }

  processValues(values) {
    return values;
  }

  formatArrayInput(input) {
    return TextFormatter.formatYAMLArray({ input });
  }

  formatNameListInput(input, fallback) {
    return TextFormatter.formatYAMLNameList({ input, fallback });
  }

  buildStandardProperties({ computedValues }) {
    return [
      `aliases: ${computedValues.aliases}`,
      `title: "${computedValues.title}"`,
      `date: "${computedValues.date}"`,
      `draft: ${computedValues.draft}`,
      `slug: ${computedValues.slug}`,
      `categories:${computedValues.categories}`,
      `tags:${computedValues.tags}`,
    ];
  }

  buildExtraProperties() {
    return [];
  }

  appendToList({ list = "", items = [] }) {
    return ListUtils.appendUniqueItems({ list, item: items });
  }

  async run(executionParams) {
    const rawInputValues = await this.#quickAddApi.requestInputs(
      this.getFields(),
    );
    const processedValues = this.processValues(rawInputValues);
    const computedValues = this.#computeStandardValues(processedValues);

    const properties = [
      ...this.buildStandardProperties({
        values: processedValues,
        computedValues,
      }),
      ...this.buildExtraProperties({ values: processedValues, computedValues }),
    ];

    const frontmatterString = serializeFrontmatter(properties);
    this.#syncExecutionVariables({
      executionParams,
      computedValues,
      processedValues,
      frontmatterString,
    });

    return frontmatterString;
  }

  #computeStandardValues(values) {
    return {
      aliases: values.aliases || "",
      title: TextFormatter.titleCase(values.title) || "NoTitle",
      slug: values.slug ?? TextFormatter.slugify(values.title),
      date: this.#quickAddApi.date.now("YYYY-MM-DDTHH:mm:ssZ"),
      draft: true,
      categories: this.formatArrayInput(values.categories),
      tags: this.formatArrayInput(values.tags),
    };
  }

  #syncExecutionVariables({
    executionParams,
    computedValues,
    frontmatterString,
    processedValues,
  }) {
    if (executionParams?.variables) {
      Object.assign(
        executionParams.variables,
        computedValues,
        processedValues,
        { frontmatter: frontmatterString },
      );
    }
  }
}

module.exports = FrontmatterBuilderBase;
