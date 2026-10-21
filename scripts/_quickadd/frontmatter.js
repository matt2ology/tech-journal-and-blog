const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const BaseFrontmatterBuilder = require(
  path.join(
    vaultPath,
    "scripts",
    "_quickadd",
    "utils",
    "frontmatter-base-builder",
  ),
);
const BookFrontmatterBuilder = require(
  path.join(
    vaultPath,
    "scripts",
    "_quickadd",
    "utils",
    "frontmatter-book-builder",
  ),
);

// Registry mapping display names to builder classes
const builders = {
  "Standard Note": BaseFrontmatterBuilder,
  "Book Note": BookFrontmatterBuilder,
};

module.exports = async function (params) {
  const { quickAddApi } = params;

  // Prompt user to pick which template schema to use
  const options = Object.keys(builders);
  const selectedChoice = await quickAddApi.suggester(options, options);

  if (!selectedChoice) return; // User cancelled

  // Instantiate and run the selected polymorphic builder
  const BuilderClass = builders[selectedChoice];
  const builder = new BuilderClass(quickAddApi);

  return await builder.run(params);
};
