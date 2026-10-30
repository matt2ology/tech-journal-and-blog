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
    const creatorId = this.getCreatorFieldId();
    const contentId = this.getContentFieldId();

    const rawCreatorInput = values[creatorId] || "";
    const rawContentInput = values[contentId] || "";

    const rawFileName = `${this.#removeAfterColon(rawContentInput)}`;
    const generatedFileName = TextFormatter.slugify(rawFileName);

    const generatedTitle = `${rawContentInput}`;

    const categories = this.appendToList({
      list: values.categories,
      items: ["synthesis", this.getCategoryType()],
    });

    return {
      ...processed,
      title: generatedTitle,
      slug: generatedFileName,
      type: `${this.getCategoryType()}`,
      filename: generatedFileName,
      [creatorId]: this.formatNameList(
        rawCreatorInput,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
      categories,
    };
  }

  buildExtraProperties({ values }) {
    const creatorId = this.getCreatorFieldId();
    const contentId = this.getContentFieldId();

    return [
      `${creatorId}: ${values[creatorId]}`,
      `${contentId}: "${values[contentId]}"`,
    ];
  }
}

module.exports = SynthesisBuilderBase;
