const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const NoteFactory = require(
  path.join(
    vaultPath,
    "_quickadd-scripts",
    "utils",
    "factories",
    "note-factory",
  ),
);

module.exports = async function (params) {
  const { quickAddApi } = params;

  // Instantiate and run the selected polymorphic builder
  const BuilderClass = NoteFactory;
  const builder = new BuilderClass(quickAddApi);

  return await builder.run(params);
};
