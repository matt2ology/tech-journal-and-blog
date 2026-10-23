const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const TextFormatter = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "text-formatter"),
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
const VaultQueryService = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "vault-query-service"),
);

/**
 * Recipe-specific frontmatter builder.
 */
class FrontmatterBuilderRecipe extends FrontmatterBuilderBase {
  getFields() {
    const rawChefOptions = VaultQueryService.getFieldValues(
      app,
      "chef",
      "cookbook",
    );
    const processedChefOptions = rawChefOptions.map((chef) =>
      TextFormatter.cleanWikiLink(chef),
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
      ? `\n**Source:** [${TextFormatter.titleCase(values.dish) || "Recipe"} by ${TextFormatter.titleCase(values.chef) || "Chef"}](${values.source})`
      : "";

    return {
      ...values,
      source: formattedSource,
      categories: this.appendToList(values.categories, "cookbook"),
      slug: TextFormatter.slugify(`${values.chef} ${values.dish}`),
      title: TextFormatter.titleCase(`${values.dish} by ${TextFormatter.formatNaturalNameList(values.chef, false)}`),
    };
  }

  buildExtraProperties(values) {
    return [
      `dish: "${TextFormatter.titleCase(values.dish) || "NoNameDish"}"`,
      `chef:${this.formatNameList(values.chef, '"NoChefNamed"')}`,
      `meal: ${values.meal || "NoMealListed"}`,
      `image: ""`,
    ];
  }
}

module.exports = FrontmatterBuilderRecipe;
