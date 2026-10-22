const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const { slugify, formatYAMLArray, titleCase } = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "formatters"),
);

class BaseFrontmatterBuilder {
  #quickAddApi;
  #baseFields;

  constructor(quickAddApi) {
    this.#quickAddApi = quickAddApi;
    this.#baseFields = [
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
        defaultValue: "a, b, c d",
      },
      {
        id: "categories",
        label: "Categories (comma separated)",
        type: "text",
        placeholder: "cat1, cat2",
        defaultValue: "a, b, c d",
      },
    ];
  }

  title = "";

  getFields() {
    return this.#baseFields;
  }

  processValues(values) {
    return values;
  }

  formatArray(input) {
    return formatYAMLArray(input);
  }

  buildStandardProperties(values) {
    const now = new Date().toISOString();
    return [
      `title: "${titleCase(values.title) || ""}"`,
      `date: "${now}"`,
      `draft: true`,
      `slug: "${slugify(values.title) || ""}"`,
      `tags:${this.formatArray(values.tags)}`,
      `categories:${this.formatArray(values.categories)}`,
    ];
  }

  buildExtraProperties(values) {
    return [];
  }

  async run(params) {
    const fields = this.getFields();
    let values = await this.#quickAddApi.requestInputs(fields);

    values = this.processValues(values);

    const standardProps = this.buildStandardProperties(values);
    const extraProps = this.buildExtraProperties(values);
    const frontmatter = this.#formatFrontmatterBlock([
      ...standardProps,
      ...extraProps,
    ]);

    // Pass frontmatter into sync helper after it is created
    this.#syncParamsVariables(params, values, frontmatter);

    return frontmatter;
  }

  // --- Private Class Methods ---

  #hasParamsVariables(params) {
    return Boolean(params && params.variables);
  }

  /**
   * Synchronizes parameter variables with the provided values.
   *
   * If the parameters contain variables, updates the `slug`, `title`,
   * and `frontmatter` variables using the corresponding values.
   * @returns {void}
   */
  #syncParamsVariables(params, values, frontmatter) {
    if (this.#hasParamsVariables(params)) {
      params.variables["slug"] = slugify(values.title) || "";
      params.variables["title"] = titleCase(values.title) || "";
      params.variables["frontmatter"] = frontmatter;
    }
  }

  #formatFrontmatterBlock(properties) {
    return `---\n${properties.join("\n")}\n---`;
  }
}

module.exports = BaseFrontmatterBuilder;
