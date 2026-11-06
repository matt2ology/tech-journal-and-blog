const FrontmatterBuilderBase = require("../base/frontmatter-builder-base");
const TextFormatter = require("../helpers/text-formatter");
const VaultQueryService = require("../services/vault-query-service");

class ContentBuilderBase extends FrontmatterBuilderBase {
  getCategoryType() {
    throw new Error("Derived classes must implement getCategoryType()");
  }
  getContentType() {
    throw new Error("Derived classes must implement getContentType()");
  }
  getContentFieldId() {
    throw new Error("Derived classes must implement getContentFieldId()");
  }
  getContentFieldLabel() {
    throw new Error("Derived classes must implement getContentFieldLabel()");
  }
  getCreatorFieldId() {
    throw new Error("Derived classes must implement getCreatorFieldId()");
  }
  getCreatorFieldLabel() {
    throw new Error("Derived classes must implement getCreatorFieldLabel()");
  }
  getSectionFieldId() {
    throw new Error("Derived classes must implement getSectionFieldId()");
  }
  getSectionFieldLabel() {
    throw new Error("Derived classes must implement getSectionFieldLabel()");
  }
  getUnitFieldId() {
    throw new Error("Derived classes must implement getUnitFieldId()");
  }
  getUnitFieldLabel() {
    throw new Error("Derived classes must implement getUnitFieldLabel()");
  }
  formatUnitIdentifier(text) {
    return text;
  }

  getFields() {
    const rootFolder = `${this.getContentType()}/${this.getCategoryType()}`;
    const rawOptions = VaultQueryService.getSubfolderNames({
      app,
      folderPath: rootFolder,
    });
    const processedOptions = rawOptions.map((opt) =>
      TextFormatter.titleCase(opt),
    );

    return [
      {
        id: this.getContentFieldId(),
        label: this.getContentFieldLabel(),
        type: "suggester",
        options: processedOptions,
        placeholder: "Enter content title (Article/Book/Course/Video)",
        defaultValue: "",
        suggesterConfig: {
          displayValues: processedOptions,
          allowCustomInput: true,
          caseSensitive: false,
          multiSelect: false,
        },
      },
      {
        id: this.getUnitFieldId(),
        label: this.getUnitFieldLabel(),
        type: "text",
        placeholder: "Enter unit (Title/Chapter/Module)",
        defaultValue: "",
      },
      {
        id: this.getSectionFieldId(),
        label: this.getSectionFieldLabel(),
        type: "text",
        placeholder: "Enter section (Part/Section/Lesson)",
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
   * Resolves the creator input using an existing content folder when a matching
   * folder is found under the specified root folder.
   *
   * If creatorInput is provided, it takes precedence and is returned unchanged.
   * Otherwise, attempts to match formattedContent against an existing subfolder
   * name. If a match is found, retrieves the existing creator field values from
   * that folder, cleans and combines them, and uses them as the resolved creator.
   *
   * Falls back to creatorInput when no matching folder or existing creator values
   * are found.
   *
   * @param {Object} params
   * @param {string} params.formattedContent - Formatted content title used to locate
   *   an existing subfolder.
   * @param {string} params.creatorInput - Explicit creator input and fallback value.
   * @param {string} [params.customRootFolder] - Optional root folder to search.
   *   Defaults to the content type and category type folder.
   * @returns {{ creatorInput: string }} The resolved creator input.
   */
  resolveContentContext({ formattedContent, creatorInput, customRootFolder }) {
    if (creatorInput) return { creatorInput };

    const rootFolder =
      customRootFolder || `${this.getContentType()}/${this.getCategoryType()}`;
    const subfolders = VaultQueryService.getSubfolderNames({
      app,
      folderPath: rootFolder,
    });

    const matched = subfolders.find(
      (sub) =>
        TextFormatter.titleCase(sub) === formattedContent ||
        sub.toLowerCase() === formattedContent.toLowerCase(),
    );

    if (!matched) return { creatorInput };

    const existingCreators = VaultQueryService.getFieldValues({
      app,
      fieldName: this.getCreatorFieldId(),
      folderPath: `${rootFolder}/${matched}`,
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
