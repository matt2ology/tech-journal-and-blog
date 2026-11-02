const FrontmatterBuilderBase = require("../base/frontmatter-builder-base");
const TextFormatter = require("../helpers/text-formatter");
const VaultQueryService = require("../services/vault-query-service");

/**
 * Intermediate base class encapsulating shared workflow behavior for content domains (analysis, notes, etc.).
 */
class ContentBuilderBase extends FrontmatterBuilderBase {
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

  getRootFolderType() {
    return "notes"; // Override in analysis to point to "analysis"
  }

  formatUnitIdentifier(text) {
    return text;
  }

  // --- Shared Implementation ---

  getFields() {
    const rawContentOptions = VaultQueryService.getSubfolderNames({
      app,
      folderPath: `${this.getRootFolderType()}/${this.getCategoryType()}`,
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
        placeholder: "Enter title/chapter/module",
        defaultValue: "",
      },
      {
        id: this.getSectionFieldId(),
        label: this.getSectionFieldLabel(),
        type: "text",
        placeholder: "Part, Section, or Lesson",
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

  resolveContentContext({ formattedContent, creatorInput }) {
    const rootFolder = `${this.getRootFolderType()}/${this.getCategoryType()}`;
    const subfolders = VaultQueryService.getSubfolderNames({
      app,
      folderPath: rootFolder,
    });

    const matchedSubfolder = subfolders.find(
      (sub) =>
        TextFormatter.titleCase(sub) === formattedContent ||
        sub.toLowerCase() === formattedContent.toLowerCase(),
    );

    if (!matchedSubfolder || creatorInput) {
      return { creatorInput };
    }

    const contentFolderPath = `${rootFolder}/${matchedSubfolder}`;
    const existingCreators = VaultQueryService.getFieldValues({
      app,
      fieldName: this.getCreatorFieldId(),
      folderPath: contentFolderPath,
    });

    const resolvedCreator =
      existingCreators.length > 0
        ? existingCreators
            .map((creator) => TextFormatter.cleanWikiLink(creator))
            .join(", ")
        : creatorInput;

    return { creatorInput: resolvedCreator };
  }
}

module.exports = ContentBuilderBase;
