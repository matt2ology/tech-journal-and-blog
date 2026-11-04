const TextFormatter = require("../helpers/text-formatter");
const ListUtils = require("../helpers/list-utils");
const { serializeFrontmatter } = require("../helpers/frontmatter-serializer");

class FrontmatterBuilderBase {
  #quickAddApi;
  #fields;

  constructor(quickAddApi) {
    const isValid = FrontmatterBuilderBase.#hasInvalidQuickAddApi({
      quickAddApi,
    });
    isValid &&
      (() => {
        throw new TypeError(
          "FrontmatterBuilderBase requires a QuickAdd API instance with requestInputs().",
        );
      })();
    this.#quickAddApi = quickAddApi;
    this.#fields = Object.freeze([
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

  static #hasInvalidQuickAddApi({ quickAddApi }) {
    const isInvalid = !Boolean(
      quickAddApi && typeof quickAddApi.requestInputs === "function",
    );
    return isInvalid;
  }

  getFields() {
    const fieldsCopy = [...this.#fields];
    return fieldsCopy;
  }

  addField(fieldDefinition) {
    this.#fields = Object.freeze([...this.#fields, fieldDefinition]);
  }

  processValues(values) {
    const processed = values;
    return processed;
  }

  formatArray(input) {
    const formatted = TextFormatter.formatYAMLArray({ input });
    return formatted;
  }

  formatNameList(input, fallback) {
    const formatted = TextFormatter.formatYAMLNameList({ input, fallback });
    return formatted;
  }

  buildStandardProperties({ computed }) {
    const props = [
      `aliases: ${computed.aliases}`,
      `title: "${computed.title}"`,
      `date: "${computed.date}"`,
      `draft: ${computed.draft}`,
      `slug: ${computed.slug}`,
      `categories:${computed.categories}`,
      `tags:${computed.tags}`,
    ];
    return props;
  }

  buildExtraProperties() {
    const emptyProps = [];
    return emptyProps;
  }

  appendToList({ list = "", items = [] }) {
    const updated = ListUtils.appendUniqueItems({ list, item: items });
    return updated;
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
    const computed = {
      aliases: values.aliases || "",
      title: TextFormatter.titleCase(values.title) || "NoTitle",
      slug: values.slug ?? TextFormatter.slugify(values.title),
      date: this.#quickAddApi.date.now("YYYY-MM-DDTHH:mm:ssZ"),
      draft: true,
      categories: this.formatArray(values.categories),
      tags: this.formatArray(values.tags),
    };
    return computed;
  }

  #syncExecutionVariables({ params, computed, frontmatter, values }) {
    const hasVariables = Boolean(params?.variables);
    hasVariables &&
      Object.assign(params.variables, computed, values, { frontmatter });
  }
}

module.exports = FrontmatterBuilderBase;
