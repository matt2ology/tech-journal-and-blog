const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const runBaseIntake = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "baseIntake.js"),
);

/**
 * Child QuickAdd script for creating structured article/resource notes.
 * Integrates with the centralized baseIntake runner.
 */
module.exports = async function (params) {
  // 1. Define unique extra input fields specific to articles/resources
  const extraInputs = [
    {
      id: "author",
      label: "Author(s)",
      type: "text",
      optional: true,
      defaultValue: "",
    },
    {
      id: "sourceUrl",
      label: "Source URL",
      type: "text",
      optional: true,
      defaultValue: "",
    },
    {
      id: "status",
      label: "Reading Status",
      type: "suggester",
      options: ["to-read", "reading", "completed", "reference"],
      optional: false,
      defaultValue: "to-read",
    },
  ];

  // 2. Define custom processor for variable transformation and frontmatter injection
  const customProcessor = async (results, variables, quickAddApi) => {
    // Map raw inputs to explicit template variables
    variables.note_type = "article";
    variables.author = results.author ? results.author.trim() : "";
    variables.sourceUrl = results.sourceUrl ? results.sourceUrl.trim() : "";
    variables.status = results.status || "to-read";

    // Generate the frontmatter block snippet to inject into {{VALUE:frontmatter}}
    const frontmatterLines = [
      `note_type: "${variables.note_type}"`,
      `author: "${variables.author}"`,
      `url: "${variables.sourceUrl}"`,
      `status: "${variables.status}"`,
    ];

    variables.addFrontmatter = frontmatterLines.join("\n");
  };

  // 3. Delegate execution to the base intake runner
  return await runBaseIntake(params, extraInputs, customProcessor);
};
