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
const VaultQueryService = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "vault-query-service"),
);
const FileCounterUtility = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "file-counter-utility"),
);

/**
 * Intermediate base class encapsulating shared workflow behavior for all analysis domains.
 */
class AnalysisBuilderBase extends FrontmatterBuilderBase {
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

  getUnitFieldId() {
    throw new Error("Derived classes must implement getUnitFieldId()");
  }

  getUnitFieldLabel() {
    throw new Error("Derived classes must implement getUnitFieldLabel()");
  }

  getSectionFieldId() {
    throw new Error("Derived classes must implement getSectionFieldId()");
  }

  getSectionFieldLabel() {
    throw new Error("Derived classes must implement getSectionFieldLabel()");
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
        id: this.getUnitFieldId(),
        label: this.getUnitFieldLabel(),
        type: "text",
        placeholder: "Enter chapter title",
        defaultValue: "",
      },
      {
        id: this.getSectionFieldId(),
        label: this.getSectionFieldLabel(),
        type: "text",
        placeholder: "Part or Major Section",
        defaultValue: "",
        optional: true,
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

  /**
   * Converts a chapter title from "Chapter N: Title" to "chNN: Title".
   *
   * Pads chapter numbers with leading zeros to ensure a minimum
   * of two digits.
   *
   * @param {string} text - The original chapter title.
   * @returns {string} The converted chapter title.
   *
   * @example
   * convertChapter("Chapter 1: The Journey Ahead");
   * // Returns: "ch01: The Journey Ahead"
   *
   * @example
   * convertChapter("Chapter 14: Navigating Your Career");
   * // Returns: "ch14: Navigating Your Career"
   */
  #convertChapter(text) {
    const result = text.replace(
      /^(?:Chapter\s+)?(\d+)(?:\.(\d+))?\s*:?\s*/,
      (_, major, minor) =>
        `ch${major.padStart(2, "0")}${minor ? "-" + minor.padStart(2, "0") : ""}: `,
    );
    return result;
  }

  processValues(values) {
    const processed = super.processValues(values);
    const creatorId = this.getCreatorFieldId();
    const contentId = this.getContentFieldId();
    const sectionId = this.getSectionFieldId();
    const unitId = this.getUnitFieldId();
    const contentOrganization = values[sectionId]
      ? `- ${values[sectionId]} - ${values[unitId] || ""}`
      : String(values[unitId] || "");

    const rawCreatorInput = values[creatorId] || "";
    const rawContentInput = values[contentId] || "";
    const rawUnitInput = values[unitId] || "";

    const cleanContent = this.#removeAfterColon(rawContentInput);

    const formattedContent = TextFormatter.titleCase(cleanContent);

    const generatedFoldername = TextFormatter.slugify(cleanContent);

    const fileIndex = FileCounterUtility.getCount({
      app,
      folderPath: `analysis/${this.getCategoryType()}/${generatedFoldername}`,
      seriesName: values.series,
    });

    const generatedFilename = TextFormatter.slugify(
      `${fileIndex} ${cleanContent} ${this.#convertChapter(rawUnitInput)}`,
    );

    const generatedTitle = TextFormatter.titleCase(
      `Analysis of ${cleanContent} - ${rawUnitInput}`,
    );

    const categories = this.appendToList({
      items: ["analysis", this.getCategoryType()],
      list: values.categories,
    });

    return {
      ...processed,
      aliases: `"${formattedContent} - ${rawUnitInput}"`,
      title: generatedTitle,
      slug: TextFormatter.slugify(
        `${cleanContent} ${this.#convertChapter(rawUnitInput)}`,
      ),
      type: `${this.getCategoryType()}`,
      folder: generatedFoldername,
      filename: generatedFilename,
      categories,
      [creatorId]: this.formatNameList(
        rawCreatorInput,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
      contentReference: `[[00-${generatedFoldername}-synthesis|${cleanContent}]] ${contentOrganization}`,
    };
  }

  buildExtraProperties({ values }) {
    const creatorId = this.getCreatorFieldId();
    const contentId = this.getContentFieldId();
    const unitId = this.getUnitFieldId();

    return [
      `${creatorId}: ${values[creatorId]}`,
      `${contentId}: "${values[contentId]}"`,
      `${unitId}: "${values[unitId]}"`,
    ];
  }
}

module.exports = AnalysisBuilderBase;
