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
    const rawContentOptions = VaultQueryService.getSubfolderNames({
      app,
      folderPath: `analysis/${this.getCategoryType()}`,
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

  /**
   * Formats a chapter title from "Chapter N: Title" to "chNN: Title".
   * @param {string} text - The original chapter title.
   * @returns {string} The formatted chapter string.
   */
  #formatChapterNumbering(text) {
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
    const rootFolder = `analysis/${this.getCategoryType()}`;
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

    const sectionValue = values[sectionFieldId];
    const unitValue = values[unitFieldId] || "";
    const contentOrganization = sectionValue
      ? `- ${sectionValue} - ${unitValue}`
      : String(unitValue);

    const rawCreatorInput = values[creatorFieldId] || "";
    const rawContentInput = values[contentFieldId] || "";

    const cleanContentTitle = TextFormatter.extractBeforeColon(rawContentInput);
    const formattedContentTitle = TextFormatter.titleCase(cleanContentTitle);
    const generatedFolderName = TextFormatter.slugify(cleanContentTitle);
    const analysisFolderPath = `analysis/${this.getCategoryType()}/${generatedFolderName}`;

    // Resolve context to auto-fill creator if matching existing folder
    const context = this.#resolveContentContext({
      formattedContent: formattedContentTitle,
      creatorInput: rawCreatorInput,
    });

    const resolvedCreatorInput = context.creatorInput;

    const fileIndex = FileCounterUtility.getCount({
      app,
      folderPath: analysisFolderPath,
      includeNext: true,
    });

    const formattedChapter = this.#formatChapterNumbering(unitValue);
    const generatedFilename = TextFormatter.slugify(
      `${fileIndex} ${cleanContentTitle} ${formattedChapter}`,
    );

    const generatedTitle = TextFormatter.titleCase(
      `Analysis of ${cleanContentTitle} - ${unitValue}`,
    );

    const updatedCategories = this.appendToList({
      items: ["analysis", this.getCategoryType()],
      list: values.categories,
    });

    return {
      ...baseProcessedValues,
      aliases: `"${formattedContentTitle} - ${unitValue}"`,
      title: generatedTitle,
      slug: TextFormatter.slugify(`${cleanContentTitle} ${formattedChapter}`),
      type: `${this.getCategoryType()}`,
      folder: generatedFolderName,
      filename: generatedFilename,
      categories: updatedCategories,
      [creatorFieldId]: this.formatNameList(
        resolvedCreatorInput,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
      contentReference: `[[00-${generatedFolderName}-synthesis|${cleanContentTitle}]] ${contentOrganization}`,
    };
  }

  buildExtraProperties({ values }) {
    const creatorFieldId = this.getCreatorFieldId();
    const contentFieldId = this.getContentFieldId();
    const unitFieldId = this.getUnitFieldId();

    return [
      `${creatorFieldId}: ${values[creatorFieldId]}`,
      `${contentFieldId}: "${values[contentFieldId]}"`,
      `${unitFieldId}: "${values[unitFieldId]}"`,
    ];
  }
}

module.exports = AnalysisBuilderBase;
