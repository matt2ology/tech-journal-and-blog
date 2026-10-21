class FrontmatterBuilder {
  constructor() {
    this.fields = new Map();
  }

  add(key, value) {
    if (value !== undefined && value !== null) {
      this.fields.set(key, value);
    }
    return this;
  }

  // New helper method to safely append values to arrays (like categories or tags)
  append(key, ...values) {
    let current = this.fields.get(key);

    // Initialize if it doesn't exist, or convert to array if it was a single value
    if (!current) {
      current = [];
    } else if (!Array.isArray(current)) {
      current = [current];
    }

    for (const val of values) {
      if (val !== undefined && val !== null && val !== "") {
        // If a comma-separated string is passed, split and trim each item
        if (typeof val === "string" && val.includes(",")) {
          val.split(",").forEach((item) => {
            const trimmed = item.trim();
            if (trimmed && !current.includes(trimmed)) current.push(trimmed);
          });
        } else {
          const trimmed = typeof val === "string" ? val.trim() : val;
          if (trimmed && !current.includes(trimmed)) current.push(trimmed);
        }
      }
    }

    this.fields.set(key, current);
    return this;
  }

  toYaml() {
    let yamlLines = ["---"];

    for (const [key, value] of this.fields.entries()) {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          yamlLines.push(`${key}: []`);
        } else {
          yamlLines.push(`${key}:`);
          value.forEach((item) => yamlLines.push(`  - "${item}"`));
        }
      } else if (typeof value === "boolean" || typeof value === "number") {
        yamlLines.push(`${key}: ${value}`);
      } else {
        yamlLines.push(`${key}: "${value}"`);
      }
    }

    yamlLines.push("---");
    return yamlLines.join("\n");
  }
}

module.exports = async (params) => {
  const { quickAddApi } = params;
  const builder = new FrontmatterBuilder();

  try {
    // Request multiple inputs at once in a single form
    const inputs = await quickAddApi.requestInputs([
      {
        id: "formattedTitle",
        label: "Title",
        type: "text",
        placeholder: "Enter note title...",
      },
      {
        id: "description",
        label: "Description",
        type: "text",
        placeholder: "Enter description...",
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
        placeholder: "obsidian, quickadd, productivity",
      },
      {
        id: "categories",
        label: "Categories (comma separated)",
        type: "text",
        placeholder: "Tech, Guides",
      },
    ]);

    // Process list fields from the collected inputs record
    const tags = inputs.tags
      ? inputs.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    const categories = inputs.categories
      ? inputs.categories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    // Populate base frontmatter
    builder
      .add("title", inputs.formattedTitle || "")
      .add("date", new Date().toISOString())
      .add("description", inputs.description || "")
      .add("draft", true)
      .add("slug", inputs.slug || "")
      .add("tags", tags)
      .add("categories", categories);

    // Expose builder for downstream macro scripts to append extra key-value pairs
    params.variables["fmBuilder"] = builder;

    return builder.toYaml();
  } catch (error) {
    // Handle cancellation if user presses Escape or closes the form
    console.log("Input form cancelled.");
    params.abort("Cancelled by user.");
  }
};
