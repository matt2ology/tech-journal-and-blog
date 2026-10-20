const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const { slugify } = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "slugify.js"),
);
const titleCase = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "titleCase.js"),
);
const formatYamlList = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "formatYamlList.js"),
);

/**
 * Base intake runner supporting polymorphism via extra inputs.
 * @param {Object} params - QuickAdd params
 * @param {Array} [extraInputs=[]] - Child-specific QuickAdd input definitions
 * @param {Function} [customProcessor=null] - Child-specific variable transformations
 */
module.exports = async function runBaseIntake(
  params,
  extraInputs = [],
  customProcessor = null,
) {
  const { quickAddApi, variables } = params;

  const baseInputs = [
    {
      id: "title",
      label: "Note Title",
      type: "text",
    },
    {
      id: "description",
      label: "Description",
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
      label: "Categories",
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
  ];

  const combinedInputs = [...baseInputs, ...extraInputs];
  const results = await quickAddApi.requestInputs(combinedInputs);

  Object.assign(variables, {
    formattedTitle: titleCase(results.title ? results.title.trim() : ""),
    slug: slugify(results.title ? results.title.trim() : ""),
    description: results.description ? results.description.trim() : "",
    tags: formatYamlList(results.tags),
    categories: formatYamlList(results.categories),

    // Pass raw results forward so child processors can access custom fields
    _rawResults: results,
  });

  // Execute polymorphic child processing if provided
  await executeCustomProcessor(
    customProcessor,
    results,
    variables,
    quickAddApi,
  );

  return variables;
};

/**
 * Executes the child-specific custom processor if it is a valid function.
 * @param {Function} [customProcessor] - The optional child processor
 * @param {Object} results - The raw user input results
 * @param {Object} variables - The QuickAdd variables object
 * @param {Object} quickAddApi - The QuickAdd API instance
 */
async function executeCustomProcessor(
  customProcessor,
  results,
  variables,
  quickAddApi,
) {
  if (typeof customProcessor === "function") {
    await customProcessor(results, variables, quickAddApi);
  }
}
