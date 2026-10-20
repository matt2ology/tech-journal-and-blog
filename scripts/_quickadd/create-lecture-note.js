// scripts/_quickadd/create-lecture-note.js
const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const runBaseIntake = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "baseIntake.js"),
);
const formatYamlList = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "formatYamlList.js"),
);

module.exports = async function (params) {
  const extraInputs = [
    {
        id: "course", 
        label: "Course Name",
        type: "text",
        optional: true,
        defaultValue: "",
    },
    {
        id: "speaker",
        label: "Speaker Name",
        type: "text",
        optional: true,
        defaultValue: "",
    }
  ];

  const customProcessor = async (results, variables) => {
    // 1. Extract categories from user input (can be an array or comma-separated string)
    let userCategories = results.categories || [];
    if (typeof userCategories === "string" && userCategories.trim()) {
      userCategories = userCategories.split(",").map((c) => c.trim());
    }

    // 2. Ensure "lecture" is always included, avoiding duplicates using Set
    const combinedCategories = Array.from(
      new Set(["lecture", ...userCategories]),
    );

    const frontmatterLines = [
        `note_type: "lecture"`,
        `course: "${results.course || ""}"`,
        `speaker: "${results.speaker || ""}"`,
    ];

    // 3. Overwrite the categories variable with the newly formatted YAML list
    variables.categories = formatYamlList(combinedCategories);
    variables.addFrontmatter = frontmatterLines.join("\n");
  };

  return await runBaseIntake(params, extraInputs, customProcessor);
};
