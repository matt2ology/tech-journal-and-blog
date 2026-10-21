/**
 * frontmatter-base.js
 *
 * Shared QuickAdd frontmatter builder.
 *
 * Derived scripts call buildFrontmatter(params, extensions).
 */

function splitCommaSeparated(value) {
  if (Array.isArray(value)) {
    return value
      .map(String)
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return String(value ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values)];
}

function quoteYaml(value) {
  // JSON string quoting is valid for ordinary YAML strings.
  return JSON.stringify(String(value ?? ""));
}

function yamlValue(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => quoteYaml(item)).join(", ")}]`;
  }
  return quoteYaml(value);
}

function buildFrontmatterYaml(properties) {
  const lines = ["---"];

  for (const [key, value] of Object.entries(properties)) {
    lines.push(`${key}: ${yamlValue(value)}`);
  }

  lines.push("---");
  return lines.join("\n");
}

async function buildFrontmatter(params, extensions = []) {
  const { quickAddApi, app, variables } = params;

  // 1. Collect standard fields and derived fields before opening the modal.
  const baseFields = [
    {
      id: "formattedTitle",
      label: "Title",
      type: "text",
      placeholder: "Enter note title...",
      defaultValue: "the title of a large book and it was returned on time",
    },
    {
      id: "description",
      label: "Description",
      type: "text",
      placeholder: "Enter description...",
      defaultValue: "A brief description of the note's content.",
    },
    {
      id: "tags",
      label: "Tags (comma separated)",
      type: "text",
      placeholder: "obsidian, quickadd, productivity",
      defaultValue: "a, b, c d",
    },
    {
      id: "categories",
      label: "Categories (comma separated)",
      type: "text",
      placeholder: "Tech, Guides",
    },
  ];

  const extensionFields = extensions.flatMap(
    (extension) => extension.fields ?? [],
  );

  const inputs = await quickAddApi.requestInputs([
    ...baseFields,
    ...extensionFields,
  ]);

  if (!inputs) return;

  const title = String(inputs.formattedTitle ?? "").trim();
  if (!title) {
    throw new Error("A note title is required.");
  }

  // 2. Create the standard properties.
  const properties = {
    title,
    date: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    description: String(inputs.description ?? "").trim(),
    draft: true,
    slug: title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    tags: unique(splitCommaSeparated(inputs.tags)),
    categories: unique(splitCommaSeparated(inputs.categories)),
  };

  // Expose base variables to derived scripts.
  Object.assign(variables, {
    title: properties.title,
    slug: properties.slug,
    description: properties.description,
  });

  // Apply derived extensions.
  for (const extension of extensions) {
    const contribution = await extension.contribute({
      inputs,
      properties: structuredClone(properties),
      app,
      variables,
    });

    if (!contribution) continue;

    // Append to existing list properties, preserving their original values.
    for (const [key, value] of Object.entries(contribution.append ?? {})) {
      if (!Array.isArray(properties[key])) {
        throw new Error(
          `Cannot append to "${key}": it is not a list property.`,
        );
      }

      properties[key] = unique([
        ...properties[key],
        ...splitCommaSeparated(value),
      ]);
    }

    // Add only new properties; existing properties are never overwritten.
    for (const [key, value] of Object.entries(contribution.add ?? {})) {
      if (Object.hasOwn(properties, key)) {
        throw new Error(
          `Property "${key}" already exists. Use append for list properties.`,
        );
      }

      properties[key] = value;
    }

    // Expose derived properties to later extensions, QuickAdd, and Markdown template.
    Object.assign(variables, contribution.variables ?? {});

    for (const [key, value] of Object.entries(contribution.add ?? {})) {
      variables[key] = value;
    }
  }

  // Build final frontmatter after all extensions have been applied.
  const frontmatter = buildFrontmatterYaml(properties);

  Object.assign(variables, {
    frontmatter,
    title: properties.title,
    slug: properties.slug,
  });

  return frontmatter;
}
module.exports = async (params) => {
  return buildFrontmatter(params);
};

// Allow derived scripts to call the builder with extensions.
module.exports.buildFrontmatter = buildFrontmatter;
