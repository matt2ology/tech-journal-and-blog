module.exports = async (params) => {
  const { quickAddApi } = params;

  // Initialize variables object if not present
  params.variables = params.variables || {};

  // 1. Define base input specifications
  let inputs = [
    {
      id: "title",
      label: "Note Title",
      type: "text",
      placeholder: "Enter note title...",
    },
    {
      id: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Brief description...",
    },
    {
      id: "slug",
      label: "Slug",
      type: "text",
      placeholder: "url-friendly-slug",
      optional: true,
    },
    {
      id: "tags",
      label: "Tags (comma-separated)",
      type: "text",
      placeholder: "tag1, tag2",
      optional: true,
    },
    {
      id: "categories",
      label: "Categories (comma-separated)",
      type: "text",
      placeholder: "category1",
      optional: true,
    },
  ];

  // 2. Hook for Derived Scripts to inject inputs
  if (params.extendInputs && typeof params.extendInputs === "function") {
    inputs = await params.extendInputs(inputs, { quickAddApi });
  }

  // 3. Request all inputs in a single modal
  let results = {};
  try {
    results = await quickAddApi.requestInputs(inputs);
  } catch (error) {
    return; // User cancelled modal
  }

  // 4. Fallbacks & Array Helpers
  const title = results.title || "Untitled";
  const slug =
    results.slug ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const toArray = (input) => {
    if (!input) return [];
    return input
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);
  };

  let frontmatter = {
    title: title,
    date: new Date().toISOString(),
    description: results.description || title,
    draft: true,
    slug: slug,
    tags: toArray(results.tags),
    categories: toArray(results.categories),
  };

  // 5. Hook for Derived Scripts to extend or append frontmatter values
  if (
    params.extendFrontmatter &&
    typeof params.extendFrontmatter === "function"
  ) {
    frontmatter = await params.extendFrontmatter(frontmatter, results, {
      quickAddApi,
    });
  }

  // 6. Format array items into valid YAML lists
  const formatList = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return " []";
    return "\n  - " + [...new Set(arr)].join("\n  - ");
  };

  // 7. Render dynamic extra fields added by derived scripts
  const excludeKeys = [
    "title",
    "date",
    "description",
    "draft",
    "slug",
    "tags",
    "categories",
  ];
  let extraFields = "";

  for (const [key, value] of Object.entries(frontmatter)) {
    if (!excludeKeys.includes(key)) {
      if (Array.isArray(value)) {
        extraFields += `\n${key}:${formatList(value)}`;
      } else if (typeof value === "boolean" || typeof value === "number") {
        extraFields += `\n${key}: ${value}`;
      } else {
        extraFields += `\n${key}: "${value}"`;
      }
    }
  }

  // 8. Build the complete YAML frontmatter string
  const frontmatterString = `---
title: "${frontmatter.title}"
date: "${frontmatter.date}"
description: "${frontmatter.description}"
draft: ${frontmatter.draft}
slug: "${frontmatter.slug}"
tags:${formatList(frontmatter.tags)}
categories:${formatList(frontmatter.categories)}${extraFields}
---`;

  // 9. Assign to QuickAdd variable
  params.variables["frontmatter"] = frontmatterString;

  // Also store individual variables in case your Markdown body needs them directly
  params.variables["formattedTitle"] = frontmatter.title;
  params.variables["slug"] = frontmatter.slug;

  return frontmatterString;
};
