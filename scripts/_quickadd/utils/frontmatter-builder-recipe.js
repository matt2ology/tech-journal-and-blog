const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const { titleCase, cleanWikiLink, slugify } = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "formatters"),
);
const FrontmatterBuilderBase = require(
  path.join(
    vaultPath,
    "scripts",
    "_quickadd",
    "utils",
    "frontmatter-builder-base",
  ),
);
const { getFieldValues } = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "getFieldValues"),
);

class FrontmatterBuilderRecipe extends FrontmatterBuilderBase {
  getFields() {
    const processedChefOptions = getFieldValues(app, "chef", "cookbook").map(
      cleanWikiLink,
    );

    return [
      {
        id: "dish",
        label: "Dish Name",
        type: "text",
        placeholder: "What is the final product?",
        defaultValue: "",
      },
      {
        id: "chef",
        label: "Chef or Cook",
        type: "suggester",
        options: processedChefOptions,
        placeholder: "Select or type chef/cook",
        suggesterConfig: {
          displayValues: processedChefOptions,
          allowCustomInput: true,
          caseSensitive: false,
          multiSelect: false,
        },
      },
      {
        id: "meal",
        label: "Meal Type",
        type: "suggester",
        options: ["Breakfast", "Lunch", "Dinner"],
        placeholder: "Select meal type",
        defaultValue: "Dinner",
        suggesterConfig: { caseSensitive: false, multiSelect: true },
      },
      {
        id: "source",
        label: "Source / URL Link",
        type: "text",
        placeholder: "e.g. [Title](URL) or plain link",
      },
    ];
  }

  processValues(values) {
    const formattedSource = values.source
      ? `\n**Source:** [${titleCase(values.dish) || "Recipe"} by ${titleCase(values.chef) || "Chef"}](${values.source})`
      : "";

    return {
      ...values,
      source: formattedSource,
      categories: this.appendToList(values.categories, "cookbook"),
      slug: slugify(`${values.chef} ${values.dish}`),
      title: titleCase(`${values.dish} by ${values.chef}`),
    };
  }

  buildExtraProperties(values) {
    return [
      `dish: "${titleCase(values.dish) || "NoNameDish"}"`,
      `chef:${this.formatNameList(values.chef, '"NoChefNamed"')}`,
      `meal: ${values.meal || "NoMealListed"}`,
      `image: ""`,
    ];
  }
}

module.exports = FrontmatterBuilderRecipe;
