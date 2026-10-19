const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const { slugify } = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "slugify.js"),
);

module.exports = async (params) => {
  const { quickAddApi, variables } = params;

  const results = await quickAddApi.requestInputs([
    {
      id: "title",
      label: "Hugo post title",
      type: "text",
    },
    {
      id: "description",
      label: "Hugo post description",
      type: "text",
      optional: true,
      defaultValue: "",
    },
    {
      id: "tags",
      label: "Tags (comma-separated)",
      type: "text",
      optional: true,
      defaultValue: "",
    },
    {
      id: "categories",
      label: "Categories (comma-separated)",
      type: "suggester",
      options: ["literature", "permanent", "blog"],
      optional: true,
      defaultValue: "",
      suggesterConfig: {
        caseSensitive: false,
        multiSelect: true,
        customOptions: true,
      },
    },
  ]);

  // Format array/multiselect inputs into YAML-safe block-style lists
  const formatYamlList = (val) => {
    if (!val) return "";

    const list = Array.isArray(val)
      ? val
      : val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    return list.map((item) => `\n  - "${slugify(item)}"`).join("");
  };

  Object.assign(variables, {
    cleanTitle: results.title.trim(),
    slug: slugify(results.title.trim()),
    description: results.description.trim() || "",
    tags: formatYamlList(results.tags), // Fixed variable name to match template
    categories: formatYamlList(results.categories),
  });

  return variables;
};
