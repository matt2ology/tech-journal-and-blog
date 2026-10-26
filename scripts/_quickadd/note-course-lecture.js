const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const FrontmatterBuilderCourseLectureSeries = require(
  path.join(
    vaultPath,
    "scripts",
    "_quickadd",
    "utils",
    "frontmatter-builder-course-lecture-series",
  ),
);

module.exports = async function (params) {
  const { quickAddApi } = params;

  // Instantiate and run the selected polymorphic builder
  const BuilderClass = FrontmatterBuilderCourseLectureSeries;
  const builder = new BuilderClass(quickAddApi);

  return await builder.run(params);
};
