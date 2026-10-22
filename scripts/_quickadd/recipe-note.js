const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const FrontmatterBuilderRecipe = require(
  path.join(
    vaultPath,
    "scripts",
    "_quickadd",
    "utils",
    "frontmatter-builder-recipe",
  ),
);

module.exports = async function (params) {
  const { quickAddApi } = params;

  // Instantiate and run the selected polymorphic builder
  const BuilderClass = FrontmatterBuilderRecipe;
  const builder = new BuilderClass(quickAddApi);

  return await builder.run(params);
};
