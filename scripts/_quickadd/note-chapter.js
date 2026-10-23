const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const FrontmatterBuilderBook = require(
  path.join(
    vaultPath,
    "scripts",
    "_quickadd",
    "utils",
    "frontmatter-builder-book",
  ),
);

module.exports = async function (params) {
  const { quickAddApi } = params;

  // Instantiate and run the selected polymorphic builder
  const BuilderClass = FrontmatterBuilderBook;
  const builder = new BuilderClass(quickAddApi);

  return await builder.run(params);
};
