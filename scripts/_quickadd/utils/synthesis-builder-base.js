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
  getResourceType() {
    throw new Error("Derived classes must implement getResourceType()");
  }

  getNameFieldId() {
    throw new Error("Derived classes must implement getNameFieldId()");
  }

  getNameFieldLabel() {
    throw new Error("Derived classes must implement getNameFieldLabel()");
  }

  getItemFieldId() {
    throw new Error("Derived classes must implement getItemFieldId()");
  }

  getItemFieldLabel() {
    throw new Error("Derived classes must implement getItemFieldLabel()");
  }

  // --- Shared Implementation ---

  getFields() {
    return [
      {
        id: this.getItemFieldId(),
        label: this.getItemFieldLabel(),
        type: "text",
        placeholder: "Enter title",
        defaultValue: "",
      },
      {
        id: this.getNameFieldId(),
        label: this.getNameFieldLabel(),
        type: "text",
        placeholder: "Enter name(s)",
        defaultValue: "",
      },
    ];
  }

  processValues(values) {
    const processed = super.processValues(values);
    const nameId = this.getNameFieldId();
    const itemId = this.getItemFieldId();

    const rawNameInput = values[nameId] || "";
    const rawItemInput = values[itemId] || "";

    // 1. Extract last names (e.g., "Michael Teske, Matt Lloyd Davies" -> "Teske, Davies")
    const lastNames = TextFormatter.extractLastNames(rawNameInput);

    // 2. Build filename: "syn - Teske, Davies - Course Name" -> kebab-cased: "syn-teske-davies-course-name"
    const rawFilename = `syn - ${lastNames} - ${rawItemInput}`;
    const generatedFilename = TextFormatter.slugify(rawFilename);

    // 3. Override title: "My Synthesis of {Course/Item Name}"
    const generatedTitle = `My Synthesis of ${rawItemInput}`;

    // 4. Automatically append domain resource type (e.g., "courses") and "synthesis" to categories
    const categories = this.appendToList({
      list: values.categories,
      items: ["synthesis", this.getResourceType()],
    });

    return {
      ...processed,
      title: generatedTitle,
      slug: generatedFilename,
      type: `${this.getResourceType()}`,
      filename: generatedFilename,
      [nameId]: this.formatNameList(
        rawNameInput,
        `Unknown ${this.getNameFieldLabel()}`,
      ),
      categories,
    };
  }

  buildExtraProperties({ values }) {
    const nameId = this.getNameFieldId();
    const itemId = this.getItemFieldId();

    return [
      `${nameId}: ${values[nameId]}`,
      `${itemId}: "${values[itemId]}"`,
    ];
  }
}

module.exports = SynthesisBuilderBase;
