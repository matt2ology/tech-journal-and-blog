class BaseFrontmatterBuilder {
  constructor(quickAddApi) {
    this.quickAddApi = quickAddApi;
    this.baseFields = [
      { id: "title", label: "Title", type: "text", placeholder: "Note Title" },
      {
        id: "description",
        label: "Description",
        type: "text",
        placeholder: "Brief description...",
      },
      {
        id: "slug",
        label: "Slug",
        type: "text",
        placeholder: "url-friendly-slug",
      },
      {
        id: "tags",
        label: "Tags (comma separated)",
        type: "text",
        placeholder: "tag1, tag2",
      },
      {
        id: "categories",
        label: "Categories (comma separated)",
        type: "text",
        placeholder: "cat1, cat2",
      },
    ];
  }

  getFields() {
    return this.baseFields;
  }

  processValues(values) {
    return values;
  }

  formatArray(input) {
    if (!input) return " []";
    const items = input
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);
    if (items.length === 0) return " []";
    return "\n  - " + items.join("\n  - ");
  }

  buildStandardProperties(values) {
    const now = new Date().toISOString();
    return [
      `title: "${values.title || ""}"`,
      `date: "${now}"`,
      `description: "${values.description || ""}"`,
      `draft: true`,
      `slug: "${values.title ? values.title.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-") : ""}"`,
      `tags:${this.formatArray(values.tags)}`,
      `categories:${this.formatArray(values.categories)}`,
    ];
  }

  buildExtraProperties(values) {
    return [];
  }

  async run(params) {
    const fields = this.getFields();
    let values = await this.quickAddApi.requestInputs(fields);

    // Allow derived classes to modify/append base field values
    values = this.processValues(values);

    if (!values.slug && values.title) {
      values.slug = values.title
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-");
    }

    if (params && params.variables) {
      params.variables["slug"] = values.slug;
      params.variables["formattedTitle"] = values.title;
    }

    const standardProps = this.buildStandardProperties(values);
    const extraProps = this.buildExtraProperties(values);

    const frontmatter = `---\n${[...standardProps, ...extraProps].join("\n")}\n---`;

    if (params && params.variables) {
      params.variables["frontmatter"] = frontmatter;
    }

    return frontmatter;
  }
}

module.exports = BaseFrontmatterBuilder;
