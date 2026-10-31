const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const AnalysisFactory = require(
  path.join(
    vaultPath,
    "_quickadd-scripts",
    "utils",
    "factories",
    "analysis-factory",
  ),
);

module.exports = async function (params) {
  const { quickAddApi } = params;

  // Instantiate and run the selected polymorphic builder
  const BuilderClass = AnalysisFactory;
  const builder = new BuilderClass(quickAddApi);

  return await builder.run(params);
};
