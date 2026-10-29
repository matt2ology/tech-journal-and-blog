const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const FrontmatterBuilderBase = require(
  path.join(
    vaultPath,
    "scripts",
    "_quickadd",
    "utils",
    "frontmatter-builder-base",
  ),
);
const TextFormatter = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "text-formatter"),
);

/**
 * Converts a plural category string into its singular form.
 */
function toSingularCategory(category) {
  const singularMap = {
    articles: "article",
    books: "book",
    courses: "course",
    podcasts: "podcast",
    talks: "talk",
  };

  return singularMap[(category || "").toLowerCase()] || category;
}

/**
 * Intermediate base class encapsulating shared workflow behavior for all synthesis domains.
 */
class SynthesisBuilderBase extends FrontmatterBuilderBase {
  constructor(quickAddApi) {
    super(quickAddApi);
  }

  // --- Template Hooks to be implemented by derived classes ---
  getCategoryType() {
    throw new Error("Derived classes must implement getCategoryType()");
  }

  getPersonNameFieldId() {
    throw new Error("Derived classes must implement getPersonNameFieldId()");
  }

  getPersonNameFieldLabel() {
    throw new Error("Derived classes must implement getPersonNameFieldLabel()");
  }

  getContentFieldId() {
    throw new Error("Derived classes must implement getContentFieldId()");
  }

  getContentFieldLabel() {
    throw new Error("Derived classes must implement getContentFieldLabel()");
  }

  // --- Shared Implementation ---

  getFields() {
    return [
      {
        id: this.getContentFieldId(),
        label: this.getContentFieldLabel(),
        type: "text",
        placeholder: "Enter title",
        defaultValue: "",
      },
      {
        id: this.getPersonNameFieldId(),
        label: this.getPersonNameFieldLabel(),
        type: "text",
        placeholder: "Enter name(s)",
        defaultValue: "",
      },
    ];
  }

  processValues(values) {
    const processed = super.processValues(values);
    const nameId = this.getPersonNameFieldId();
    const itemId = this.getContentFieldId();

    const rawNameInput = values[nameId] || "";
    const rawItemInput = values[itemId] || "";

    const singularCategory = toSingularCategory(this.getCategoryType());

    const rawFilename = `syn - ${singularCategory} - ${rawItemInput}`;
    const generatedFilename = TextFormatter.slugify(rawFilename);

    const generatedTitle = `Synthesis of ${singularCategory} - ${rawItemInput}`;

    const categories = this.appendToList({
      list: values.categories,
      items: ["synthesis", this.getCategoryType()],
    });

    return {
      ...processed,
      title: generatedTitle,
      slug: generatedFilename,
      type: `${this.getCategoryType()}`,
      filename: generatedFilename,
      [nameId]: this.formatNameList(
        rawNameInput,
        `Unknown ${this.getPersonNameFieldLabel()}`,
      ),
      categories,
    };
  }

  buildExtraProperties({ values }) {
    const contentId = this.getContentFieldId();
    const personId = this.getPersonNameFieldId();

    return [
      `${contentId}: "${values[contentId]}"`,
      `${personId}: ${values[personId]}`,
    ];
  }
}

module.exports = SynthesisBuilderBase;
