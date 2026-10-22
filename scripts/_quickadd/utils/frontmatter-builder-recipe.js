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

const { getFieldValues } = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "getFieldValues"),
);

/**
 * Cleans a wiki-link string and extracts its alias or target text.
 * e.g. "[[path/to/slug|Chef Name]]" -> "Chef Name"
 *      "[[Chef Name]]" -> "Chef Name"
 */
function cleanWikiLink(opt) {
  if (typeof opt !== "string") return opt;
  const cleaned = opt.replace(/^"?"?\[\[|\]\]"?"?$/g, "");
  const parts = cleaned.split("|");
  return parts.length > 1 ? parts[1] : parts[0];
}

/**
 * Adds recipe-specific inputs and metadata to the shared frontmatter workflow.
 */
class FrontmatterBuilderRecipe extends FrontmatterBuilderBase {
  getFields() {
    // Dynamically fetch unique chef values from the cookbook folder (adjust path as needed)
    const rawChefOptions = getFieldValues(app, "chef", "cookbook");
    const processedChefOptions = rawChefOptions.map(cleanWikiLink);

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
    const chefName = values.chef;
    const formattedSource = values.source
      ? `\n**Source:** [${titleCase(values.dish) || "Recipe"} by ${titleCase(chefName) || "Chef"}](${values.source})`
      : "";

    return {
      ...values,
      source: formattedSource, // Overrides the raw URL input with your formatted markdown string
      categories: this.appendToList(values.categories, "cookbook"),
      slug: slugify(`${values.chef} ${values.dish}`),
      title: titleCase(`${values.dish} by ${values.chef}`),
    };
  }

  buildExtraProperties(values) {
    const chefName = values.chef;
    const chefValue = chefName
      ? `[[${slugify(chefName)}|${titleCase(chefName)}]]`
      : "NoChefNamed";

    return [
      `dish: "${titleCase(values.dish) || "NoNameDish"}"`,
      `chef: "${chefValue}"`,
      `meal: ${values.meal || "NoMealListed"}`,
      `image: ${""}`,
    ];
  }
}

module.exports = FrontmatterBuilderRecipe;
