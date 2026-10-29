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

  getCreatorFieldId() {
    throw new Error("Derived classes must implement getCreatorFieldId()");
  }

  getCreatorFieldLabel() {
    throw new Error("Derived classes must implement getCreatorFieldLabel()");
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
        id: this.getCreatorFieldId(),
        label: this.getCreatorFieldLabel(),
        type: "text",
        placeholder: "Enter name(s)",
        defaultValue: "",
      },
    ];
  }

  #removeAfterColon(text) {
    return text ? text.split(":")[0].trim() : "";
  }

  processValues(values) {
    const processed = super.processValues(values);
    const nameId = this.getCreatorFieldId();
    const contentId = this.getContentFieldId();

    const rawCreatorInput = values[nameId] || "";
    const rawContentInput = values[contentId] || "";

    const singularCategory = toSingularCategory(this.getCategoryType());

    const rawFilename = `${this.#removeAfterColon(rawContentInput)}`;
    const generatedFilename = TextFormatter.slugify(rawFilename);

    const generatedTitle = `${rawContentInput}`;

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
        rawCreatorInput,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
      categories,
    };
  }

  buildExtraProperties({ values }) {
    const contentId = this.getContentFieldId();
    const personId = this.getCreatorFieldId();

    return [
      `${contentId}: "${values[contentId]}"`,
      `${personId}: ${values[personId]}`,
    ];
  }
}

module.exports = SynthesisBuilderBase;
