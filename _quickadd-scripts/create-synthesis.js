const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const SynthesisFactory = require(
  path.join(
    vaultPath,
    "scripts",
    "_quickadd",
    "utils",
    "factories",
    "synthesis-factory",
  ),
);

module.exports = async function (params) {
  const { quickAddApi } = params;

  // Instantiate and run the selected polymorphic builder
  const BuilderClass = SynthesisFactory;
  const builder = new BuilderClass(quickAddApi);

  return await builder.run(params);
};
