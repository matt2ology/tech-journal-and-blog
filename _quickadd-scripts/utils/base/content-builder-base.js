const FrontmatterBuilderBase = require("../base/frontmatter-builder-base");
const TextFormatter = require("../helpers/text-formatter");
const VaultQueryService = require("../services/vault-query-service");

class ContentBuilderBase extends FrontmatterBuilderBase {
  getDomainType() {
    throw new Error("Derived classes must implement getDomainType()");
  }
  getKnowledgeResourceType() {
    throw new Error("Derived classes must implement getKnowledgeResourceType()");
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

  extractContentFields(values) {
    return {
      creatorFieldId: this.getCreatorFieldId(),
      contentFieldId: this.getContentFieldId(),
      sectionFieldId: this.getSectionFieldId(),
      unitFieldId: this.getUnitFieldId(),
      creatorInput: values[this.getCreatorFieldId()] || "",
      contentInput: values[this.getContentFieldId()] || "",
      sectionValue: values[this.getSectionFieldId()] || "",
      unitValue: values[this.getUnitFieldId()] || "",
    };
  }

  getFields() {
    const rootFolder = `${this.getKnowledgeResourceType()}/${this.getDomainType()}`;
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

  resolveContentContext({ formattedContent, creatorInput, customRootFolder }) {
    if (creatorInput) return { creatorInput };

    const rootFolder =
      customRootFolder || `${this.getKnowledgeResourceType()}/${this.getDomainType()}`;
    const subfolders = VaultQueryService.getSubfolderNames({
      app,
      folderPath: rootFolder,
    });

    const matchedFolder = subfolders.find(
      (sub) =>
        TextFormatter.titleCase(sub) === formattedContent ||
        sub.toLowerCase() === formattedContent.toLowerCase(),
    );

    if (!matchedFolder) return { creatorInput };

    const existingCreators = VaultQueryService.getFieldValues({
      app,
      fieldName: this.getCreatorFieldId(),
      folderPath: `${rootFolder}/${matchedFolder}`,
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
