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

  processValues(values) {
    const baseProcessedValues = super.processValues(values);
    const creatorFieldId = this.getCreatorFieldId();
    const contentFieldId = this.getContentFieldId();

    const rawCreatorInput = values[creatorFieldId] || "";
    const rawContentInput = values[contentFieldId] || "";

    const cleanContentTitle = TextFormatter.extractBeforeColon(rawContentInput);
    const generatedFileName = TextFormatter.slugify(
      `00-${cleanContentTitle}-synthesis`,
    );
    const generatedTitle = `${rawContentInput} - Overview & Synthesis`;

    const updatedCategories = this.appendToList({
      list: values.categories,
      items: ["synthesis", this.getCategoryType()],
    });

    return {
      ...baseProcessedValues,
      title: generatedTitle,
      slug: generatedFileName,
      type: `${this.getCategoryType()}`,
      filename: generatedFileName,
      [creatorFieldId]: this.formatNameList(
        rawCreatorInput,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
      categories: updatedCategories,
    };
  }

  buildExtraProperties({ values }) {
    const creatorFieldId = this.getCreatorFieldId();
    const contentFieldId = this.getContentFieldId();

    return [
      `${creatorFieldId}: ${values[creatorFieldId]}`,
      `${contentFieldId}: "${values[contentFieldId]}"`,
    ];
  }
}

module.exports = SynthesisBuilderBase;
