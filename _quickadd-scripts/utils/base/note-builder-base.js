const FileCounterUtility = require("../helpers/file-counter-utility");
const FrontmatterBuilderBase = require("../base/frontmatter-builder-base");
const TextFormatter = require("../helpers/text-formatter");
const VaultQueryService = require("../services/vault-query-service");

/**
 * Intermediate base class encapsulating shared workflow behavior for all analysis domains.
 */
class NoteBuilderBase extends FrontmatterBuilderBase {
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
    const rawContentOptions = VaultQueryService.getSubfolderNames({
      app,
      folderPath: `notes/${this.getCategoryType()}`,
    });
    const processedContentOptions = rawContentOptions.map((option) =>
      TextFormatter.titleCase(option),
    );

    return [
      {
        id: this.getContentFieldId(),
        label: this.getContentFieldLabel(),
        type: "suggester",
        options: processedContentOptions,
        placeholder: "Enter title or select existing",
        defaultValue: "",
        suggesterConfig: {
          displayValues: processedContentOptions,
          allowCustomInput: true,
          caseSensitive: false,
          multiSelect: false,
        },
      },
      {
        id: this.getUnitFieldId(),
        label: this.getUnitFieldLabel(),
        type: "text",
        placeholder: "Chapter, Module, Part title",
        defaultValue: "",
      },
      {
        id: this.getSectionFieldId(),
        label: this.getSectionFieldLabel(),
        type: "text",
        placeholder: "Lesson, Section, Subchapter",
        defaultValue: "",
        optional: true,
      },
      {
        id: this.getCreatorFieldId(),
        label: this.getCreatorFieldLabel(),
        type: "text",
        placeholder: "Enter name(s) (auto-fills from existing notes if blank)",
        defaultValue: "",
      },
    ];
  }

  /**
   * Formats a unit title identifier. Overridden by subclasses for specific prefixes (e.g., ch, mod).
   * @param {string} text - The original unit title.
   * @returns {string} The formatted unit string.
   */
  formatUnitIdentifier(text) {
    return text.replace(
      /^(?:Chapter\s+)?(\d+)(?:\.(\d+))?\s*:?\s*/,
      (_, major, minor) =>
        `ch${major.padStart(2, "0")}${minor ? "-" + minor.padStart(2, "0") : ""}: `,
    );
  }

  /**
   * Resolves whether the content title matches an existing subfolder.
   * Auto-fills creator from existing notes if blank.
   *
   * @param {Object} options - { formattedContent, creatorInput }
   * @returns {Object} { creatorInput }
   */
  #resolveContentContext({ formattedContent, creatorInput }) {
    const rootFolder = `notes/${this.getCategoryType()}`;
    const subfolders = VaultQueryService.getSubfolderNames({
      app,
      folderPath: rootFolder,
    });

    const matchedSubfolder = subfolders.find(
      (sub) =>
        TextFormatter.titleCase(sub) === formattedContent ||
        sub.toLowerCase() === formattedContent.toLowerCase(),
    );

    if (!matchedSubfolder) {
      return { creatorInput };
    }

    let resolvedCreator = creatorInput;
    if (!resolvedCreator) {
      const contentFolderPath = `${rootFolder}/${matchedSubfolder}`;
      const existingCreators = VaultQueryService.getFieldValues({
        app,
        fieldName: this.getCreatorFieldId(),
        folderPath: contentFolderPath,
      });

      if (existingCreators.length > 0) {
        resolvedCreator = existingCreators
          .map((creator) => TextFormatter.cleanWikiLink(creator))
          .join(", ");
      }
    }

    return {
      creatorInput: resolvedCreator,
    };
  }

  processValues(values) {
    const baseProcessedValues = super.processValues(values);
    const creatorFieldId = this.getCreatorFieldId();
    const contentFieldId = this.getContentFieldId();
    const sectionFieldId = this.getSectionFieldId();
    const unitFieldId = this.getUnitFieldId();

    const unitValue = values[unitFieldId] || "";
    const sectionValue = values[sectionFieldId] || "";
    const contentOrganization = sectionValue
      ? `${unitValue} - ${sectionValue}`
      : `${unitValue}`;

    const creatorInput = values[creatorFieldId] || "";
    const contentInput = values[contentFieldId] || "";

    // Title: subtitle
    const extractedTitle = TextFormatter.extractBeforeColon(contentInput);
    const formattedContentTitle = TextFormatter.titleCase(extractedTitle);
    const generatedFolderName = TextFormatter.slugify(extractedTitle);

    // Resolve context to auto-fill creator if matching existing folder
    const context = this.#resolveContentContext({
      formattedContent: formattedContentTitle,
      creatorInput,
    });

    const resolvedCreatorInput = context.creatorInput;

    const notesFolderPath = `notes/${this.getCategoryType()}/${generatedFolderName}`;
    const fileIndex = FileCounterUtility.getCount({
      app,
      folderPath: notesFolderPath,
      includeNext: true,
    });

    const formattedUnit = this.formatUnitIdentifier(unitValue);
    const generatedFilename = TextFormatter.slugifyAdjacent(
      `n${fileIndex} ${extractedTitle} ${formattedUnit} ${sectionValue}`,
    );

    const generatedTitle = unitValue
      ? TextFormatter.titleCase(`Notes on ${extractedTitle} - ${unitValue}`)
      : TextFormatter.titleCase(`Notes on ${extractedTitle}`);

    const updatedCategories = this.appendToList({
      list: values.categories,
      items: ["notes", this.getCategoryType()],
    });

    return {
      ...baseProcessedValues,
      aliases: `"${formattedContentTitle} - ${unitValue}"`,
      title: generatedTitle,
      slug: TextFormatter.slugify(`${extractedTitle} - ${formattedUnit}`),
      type: this.getCategoryType(),
      folder: generatedFolderName,
      filename: generatedFilename,
      categories: updatedCategories,
      [creatorFieldId]: this.formatNameList(
        resolvedCreatorInput,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
      note_header: sectionValue || unitValue || "Notes & Key Points",
      reference_links: `${extractedTitle} - [[${generatedFilename}|${contentOrganization}]]`,
    };
  }

  buildExtraProperties({ values }) {
    const creatorFieldId = this.getCreatorFieldId();
    const contentFieldId = this.getContentFieldId();
    const unitFieldId = this.getUnitFieldId();
    const sectionFieldId = this.getSectionFieldId();

    return [
      `${creatorFieldId}: ${values[creatorFieldId]}`,
      `${contentFieldId}: "${values[contentFieldId]}"`,
      `${unitFieldId}: "${values[unitFieldId]}"`,
      `${sectionFieldId}: "${values[sectionFieldId]}"`,
    ];
  }
}

module.exports = NoteBuilderBase;
