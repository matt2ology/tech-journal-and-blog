module.exports = async (params) => {
  const { quickAddApi } = params;
  const builder = params.variables["fmBuilder"];

  if (!builder) {
    console.error("FrontmatterBuilder instance not found in macro context.");
    return;
  }

  // Request extra metadata or additional category inputs from the user
  const inputs = await quickAddApi.requestInputs([
    {
      id: "author",
      label: "Author",
      type: "text",
      placeholder: "Enter Author...",
    },
    {
      id: "extraCategories",
      label: "Additional Categories to Append",
      type: "text",
      placeholder: "Plugins, Workflow",
      defaultValue: "Literature, Guides",
    },
    {
      id: "rating",
      label: "Rating (1-5)",
      type: "suggester",
      options: ["1", "2", "3", "4", "5"],
      placeholder: "Select a rating...",
    },
  ]);

  // Set standard metadata fields
  builder
    .add("author", inputs.author || "Unknown Author")
    .add("rating", inputs.rating ? Number(inputs.rating) : null);

  // Dynamically append values to the existing categories array
  if (inputs.extraCategories) {
    builder.append("categories", ...inputs.extraCategories.split(",").map((c) => c.trim()).filter(Boolean));
  }

  // You can also append programmatically without user input if needed:
  // builder.append("categories", "Featured", "Archived");

  const finalYaml = builder.toYaml();
  params.variables["finalFrontmatter"] = finalYaml;

  return finalYaml;
};
