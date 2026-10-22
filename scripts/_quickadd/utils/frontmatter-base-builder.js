const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const { slugify, formatYAMLArray, titleCase } = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "formatters"),
);

class BaseFrontmatterBuilder {
  #quickAddApi;

  constructor(quickAddApi) {
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

  processValues(values) {
    return values;
  }

  formatArray(input) {
    return formatYAMLArray(input);
  }

  buildStandardProperties(values, computed = {}) {
    const properties = {
      title: computed.title ?? (titleCase(values.title) || ""),
      date: computed.date ?? new Date().toISOString(),
      draft: computed.draft ?? true,
      slug: computed.slug ?? (slugify(values.title) || ""),
      tags: computed.tags ?? this.formatArray(values.tags),
      categories: computed.categories ?? this.formatArray(values.categories),
    };

    return [
      `title: "${properties.title}"`,
      `date: "${properties.date}"`,
      `draft: ${properties.draft}`,
      `slug: "${properties.slug}"`,
      `tags:${properties.tags}`,
      `categories:${properties.categories}`,
    ];
  }

  buildExtraProperties() {
    return [];
  }

  appendToList(list = "", item) {
    const items = new Set(
      list
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    );

    items.add(item);

    return [...items].join(", ");
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
    const frontmatter = this.#formatFrontmatter(properties);

    this.#syncParamsVariables(params, computed, frontmatter);
    return frontmatter;
  }

  #computeStandardValues(values) {
    return {
      title: titleCase(values.title) || "",
      slug: slugify(values.title) || "",
      date: new Date().toISOString(),
      draft: true,
      tags: this.formatArray(values.tags),
      categories: this.formatArray(values.categories),
    };
  }

  #syncParamsVariables(params, computed, frontmatter) {
    if (!params?.variables) return;

    Object.assign(params.variables, computed, { frontmatter });
  }

  #formatFrontmatter(properties) {
    return `---\n${properties.join("\n")}\n---`;
  }
}

module.exports = BaseFrontmatterBuilder;
