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

  /**
   * Builds an array of standard frontmatter property strings.
   *
   * Uses pre-computed values if available; otherwise, falls back to computing
   * them dynamically from the provided values.
   *
   * @param {Object} values - The raw or processed input values object.
   * @param {Object} [computed={}] - Optional pre-computed standard property values
   *                                  (e.g., title, slug, date, draft, tags, categories).
   * @returns {string[]} An array of formatted frontmatter property assignment strings.
   */
  buildStandardProperties(values, computed = {}) {
    const title = computed.title ?? (titleCase(values.title) || "");
    const slug = computed.slug ?? (slugify(values.title) || "");
    const date = computed.date ?? new Date().toISOString();
    const tags = computed.tags ?? this.formatArray(values.tags);
    const categories =
      computed.categories ?? this.formatArray(values.categories);
    const draft = computed.draft ?? true;

    return [
      `title: "${title}"`,
      `date: "${date}"`,
      `draft: ${draft}`,
      `slug: "${slug}"`,
      `tags:${tags}`,
      `categories:${categories}`,
    ];
  }

  buildExtraProperties(values, computed = {}) {
    return [];
  }

  async run(params) {
    const fields = this.getFields();
    let values = await this.#quickAddApi.requestInputs(fields);

    values = this.processValues(values);

    // Compute and assign standard property values once
    const computed = {
      title: titleCase(values.title) || "",
      slug: slugify(values.title) || "",
      date: new Date().toISOString(),
      draft: true,
      tags: this.formatArray(values.tags),
      categories: this.formatArray(values.categories),
    };

    const standardProps = this.buildStandardProperties(values, computed);
    const extraProps = this.buildExtraProperties(values, computed);
    const frontmatter = this.#formatFrontmatterBlock([
      ...standardProps,
      ...extraProps,
    ]);

    // Sync all standard properties and frontmatter into params.variables
    this.#syncParamsVariables(params, computed, frontmatter);

    return frontmatter;
  }

  // --- Private Class Methods ---

  /**
   * Checks whether the given parameters object contains a `variables` property.
   * 
   * @param {Object} [params] - The parameters object passed to the QuickAdd script.
   * @returns {boolean} True if both `params` and `params.variables` are present, otherwise false.
   */
  #hasParamsVariables(params) {
    return Boolean(params && params.variables);
  }

  /**
   * Synchronizes all computed standard properties and frontmatter with parameter variables.
   * @returns {void}
   */
  #syncParamsVariables(params, computed, frontmatter) {
    if (this.#hasParamsVariables(params)) {
      for (const [key, value] of Object.entries(computed)) {
        params.variables[key] = value;
        new Notice(`${value}`);
      }
      params.variables["frontmatter"] = frontmatter;
    }
  }

  #formatFrontmatterBlock(properties) {
    return `---\n${properties.join("\n")}\n---`;
  }
}

module.exports = BaseFrontmatterBuilder;
