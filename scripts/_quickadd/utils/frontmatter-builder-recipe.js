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
    const rawChefOptions = VaultQueryService.getFieldValues({
      app,
      fieldName: "chef",
      folderPath: "cookbook",
    });
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
        id: "source_title",
        label: "Source Title",
        type: "text",
        placeholder: "Title of the link (optional)",
        optional: true,
      },
      {
        id: "source",
        label: "URL Link",
        type: "text",
        placeholder: "Plain link - the URL",
      },
    ];
  }

  processValues(values) {
    const formattedSource = FrontmatterBuilderRecipe.#formatSourceLink({
      source: values.source,
      sourceTitle: values.source_title,
      dish: values.dish,
      chef: values.chef,
    });

    return {
      ...values,
      source: formattedSource,
      categories: this.appendToList({
        list: values.categories,
        items: ["cookbook"],
      }),
      slug: TextFormatter.slugify(`${values.chef} ${values.dish}`),
      title: TextFormatter.titleCase(
        `${values.dish} by ${TextFormatter.formatPlainNaturalNameList(values.chef)}`,
      ),
    };
  }

  static #formatSourceLink({ source, sourceTitle, dish, chef }) {
    if (!source) return "";

    const trimmedSource = source.trim();
    const dishTitle = TextFormatter.titleCase(dish) || "Recipe";
    const chefTitle = TextFormatter.titleCase(chef) || "Chef";
    const linkTitle = sourceTitle?.trim() || `${dishTitle} by ${chefTitle}`;

    return `\n**Source:** [${linkTitle}](${trimmedSource})`;
  }

  buildExtraProperties({ values }) {
    return [
      `dish: "${TextFormatter.titleCase(values.dish) || "NoNameDish"}"`,
      `chef:${this.formatNameList(values.chef, '"NoChefNamed"')}`,
      `meal: ${values.meal || "NoMealListed"}`,
      `image: ""`,
    ];
  }
}

module.exports = FrontmatterBuilderRecipe;
