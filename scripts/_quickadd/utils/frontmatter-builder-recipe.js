const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const { slugify, titleCase } = require(
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

/**
 * Adds recipe-specific inputs and metadata to the shared frontmatter workflow.
 */
class FrontmatterBuilderRecipe extends FrontmatterBuilderBase {
  getFields() {
    return [
      ...super.getFields(),
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
        placeholder: "Select or type chef/cook",
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
        id: "link",
        label: "Source / URL Link",
        type: "text",
        placeholder: "e.g. [Title](URL) or plain link",
      },
    ];
  }

  processValues(values) {
    return {
      ...values,
      categories: this.appendToList(values.categories, "cookbook"),
      slug: slugify(`${values.chef} ${values.dish}`),
      title: titleCase(`${values.dish} by ${values.chef}`),
    };
  }

  buildExtraProperties(values) {
    return [
      `dish: "${titleCase(values.dish) || "NoNameDish"}"`,
      `chef: "${values.chef || "NoName"}"`,
      `meal: ${values.meal || "NoMealListed"}`,
      `link: ${values.source || ""}`,
      `image: ${""}`,
    ];
  }
}

module.exports = FrontmatterBuilderRecipe;
