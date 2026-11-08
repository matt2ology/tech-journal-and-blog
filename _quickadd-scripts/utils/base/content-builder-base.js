const FrontmatterBuilderBase = require("../base/frontmatter-builder-base");
const TextFormatter = require("../helpers/text-formatter");
const VaultQueryService = require("../services/vault-query-service");

class ContentBuilderBase extends FrontmatterBuilderBase {
  getDomainType() {
    throw new Error("Derived classes must implement getDomainType()");
  }
  getKnowledgeResourceType() {
    throw new Error(
      "Derived classes must implement getKnowledgeResourceType()",
    );
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

  /**
   * Extracts content and creator field IDs along with their respective input values.
   * @param {Object} values - The raw input values object from QuickAdd.
   * @returns {Object} An object containing the field IDs and their extracted string values.
   * @property {string} creatorFieldId - The ID of the creator field.
   * @property {string} contentFieldId - The ID of the content field.
   * @property {string} creatorInput - The value entered for the creator field.
   * @property {string} contentInput - The value entered for the content field.
   */
  extractContentFields(values) {
    return {
      creatorFieldId: this.getCreatorFieldId(),
      contentFieldId: this.getContentFieldId(),
      creatorInput: values[this.getCreatorFieldId()] || "",
      contentInput: values[this.getContentFieldId()] || "",
    };
  }

  /**
   * Generates the uniform folder path: getKnowledgeResourceType() / getDomainType() / slugified(extractedTitle)
   */
  getGeneratedFolderPath(contentInput) {
    const extractedTitle = TextFormatter.extractBeforeColon
      ? TextFormatter.extractBeforeColon(contentInput)
      : contentInput.split(":")[0].trim();
    const slugifiedTitle = TextFormatter.slugify(extractedTitle);
    return `${this.getKnowledgeResourceType()}/${this.getDomainType()}/${slugifiedTitle}`;
  }

  /**
   * Processes raw input values by extracting content details and generating a target folder path.
   * @param {Object} values - The raw input values object.
   * @returns {Object} A new object containing all original values plus the computed `folderPath`.
   */
  processValues(values) {
    const { contentInput } = this.extractContentFields(values);
    const folderPath = contentInput
      ? this.getGeneratedFolderPath(contentInput)
      : "";

    return {
      ...values,
      folderPath: folderPath,
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
        id: this.getCreatorFieldId(),
        label: this.getCreatorFieldLabel(),
        type: "text",
        placeholder: "Enter name(s) (auto-fills from existing notes if blank)",
        defaultValue: "",
      },
    ];
  }

  /**
   * Resolves the creator context for a formatted content item.
   * @param {Object} options - The content context options.
   * @param {string} options.formattedContent - The formatted content title.
   * @param {string} options.creatorInput - The creator input value.
   * @param {string} [options.customRootFolder] - The custom root folder path.
   * @returns {Object} An object containing the resolved creator input.
   */
  resolveContentContext({ formattedContent, creatorInput, customRootFolder }) {
    if (creatorInput) return { creatorInput };

    const rootFolder =
      customRootFolder ||
      `${this.getKnowledgeResourceType()}/${this.getDomainType()}`;
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
