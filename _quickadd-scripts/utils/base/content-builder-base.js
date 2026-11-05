const FrontmatterBuilderBase = require("../base/frontmatter-builder-base");
const TextFormatter = require("../helpers/text-formatter");
const VaultQueryService = require("../services/vault-query-service");

class ContentBuilderBase extends FrontmatterBuilderBase {
  getContentType() {
    throw new Error("Derived classes must implement getContentType()");
  }
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
        placeholder: "Enter title or select existing",
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

  resolveContentContext({ formattedContent, creatorInput, customRootFolder }) {
    if (creatorInput) return { creatorInput };

    const rootFolder =
      customRootFolder ||
      `${this.getContentType()}/${this.getCategoryType()}`;
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
