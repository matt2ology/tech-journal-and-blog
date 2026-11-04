const FrontmatterBuilderBase = require("../base/frontmatter-builder-base");
const TextFormatter = require("../helpers/text-formatter");
const VaultQueryService = require("../services/vault-query-service");

class SynthesisBuilder extends FrontmatterBuilderBase {
  constructor(quickAddApi) {
    super(quickAddApi);
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
        placeholder: "Enter title or select existing analysis folder",
        defaultValue: "",
        suggesterConfig: {
          displayValues: processedContentOptions,
          allowCustomInput: true,
          caseSensitive: false,
          multiSelect: false,
        },
      },
      {
        id: this.getCreatorFieldId(),
        label: this.getCreatorFieldLabel(),
        type: "text",
        placeholder:
          "Enter name(s) (auto-fills from existing analysis if blank)",
        defaultValue: "",
      },
    ];
  }

  // Decompose Conditionals: separate condition, then, and else logic
  #matchesSubfolder(sub, formattedContent) {
    return (
      TextFormatter.titleCase(sub) === formattedContent ||
      sub.toLowerCase() === formattedContent.toLowerCase()
    );
  }

  #resolveCreatorInput({ rootFolder, matchedSubfolder, creatorInput }) {
    if (creatorInput) {
      return creatorInput;
    }
    const contentFolderPath = `${rootFolder}/${matchedSubfolder}`;
    const existingCreators = VaultQueryService.getFieldValues({
      app,
      fieldName: this.getCreatorFieldId(),
      folderPath: contentFolderPath,
    });

    if (existingCreators.length > 0) {
      return existingCreators
        .map((creator) => TextFormatter.cleanWikiLink(creator))
        .join(", ");
    }
    return "";
  }

  #resolveContentContext({ formattedContent, creatorInput }) {
    const rootFolder = `analysis/${this.getCategoryType()}`;
    const subfolders = VaultQueryService.getSubfolderNames({
      app,
      folderPath: rootFolder,
    });
    const matchedSubfolder = subfolders.find((sub) =>
      this.#matchesSubfolder(sub, formattedContent),
    );

    if (!matchedSubfolder) {
      return { creatorInput };
    }

    return {
      creatorInput: this.#resolveCreatorInput({
        rootFolder,
        matchedSubfolder,
        creatorInput,
      }),
    };
  }

  processValues(values) {
    const baseProcessedValues = super.processValues(values);
    const creatorFieldId = this.getCreatorFieldId();
    const contentFieldId = this.getContentFieldId();

    const creatorInput = values[creatorFieldId] || "";
    const contentInput = values[contentFieldId] || "";

    const extractedTitle =
      typeof TextFormatter.extractBeforeColon === "function"
        ? TextFormatter.extractBeforeColon(contentInput)
        : contentInput.split(":")[0].trim();

    const formattedContentTitle = TextFormatter.titleCase(extractedTitle);
    const generatedFolderName = TextFormatter.slugify(extractedTitle);
    const context = this.#resolveContentContext({
      formattedContent: formattedContentTitle,
      creatorInput,
    });

    return {
      ...baseProcessedValues,
      aliases: `"${contentInput} Synthesis"`,
      title: TextFormatter.titleCase(`Synthesis of ${extractedTitle}`),
      slug: generatedFolderName,
      type: `${this.getCategoryType()}`,
      folder: generatedFolderName,
      filename: `00-${generatedFolderName}-synthesis`,
      categories: this.appendToList({
        list: values.categories,
        items: ["synthesis", this.getCategoryType()],
      }),
      [creatorFieldId]: this.formatNameList(
        context.creatorInput,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
    };
  }

  buildExtraProperties({ values }) {
    const creatorFieldId = this.getCreatorFieldId();
    const contentFieldId = this.getContentFieldId();
    return [
      `note_type: ${this.getRootFolderType()}`,
      `domain: ${this.getCategoryType()}`,
      `${creatorFieldId}: ${values[creatorFieldId]}`,
      `${contentFieldId}: "${values[contentFieldId]}"`,
    ];
  }
}

module.exports = SynthesisBuilder;
