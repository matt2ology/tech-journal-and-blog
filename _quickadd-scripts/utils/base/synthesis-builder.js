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

    const fields = [
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
    return fields;
  }

  #matchesSubfolder(sub, formattedContent) {
    const isMatch =
      TextFormatter.titleCase(sub) === formattedContent ||
      sub.toLowerCase() === formattedContent.toLowerCase();
    return isMatch;
  }

  #resolveCreatorInput({ rootFolder, matchedSubfolder, creatorInput }) {
    const contentFolderPath = `${rootFolder}/${matchedSubfolder}`;
    const existingCreators = VaultQueryService.getFieldValues({
      app,
      fieldName: this.getCreatorFieldId(),
      folderPath: contentFolderPath,
    });

    const hasExisting = existingCreators.length > 0;
    const resolved =
      creatorInput ||
      (hasExisting
        ? existingCreators
            .map((creator) => TextFormatter.cleanWikiLink(creator))
            .join(", ")
        : "");
    return resolved;
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

    const resolvedCreator = matchedSubfolder
      ? this.#resolveCreatorInput({
          rootFolder,
          matchedSubfolder,
          creatorInput,
        })
      : creatorInput;

    const context = { creatorInput: resolvedCreator };
    return context;
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

    const result = {
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
    return result;
  }

  buildExtraProperties({ values }) {
    const creatorFieldId = this.getCreatorFieldId();
    const contentFieldId = this.getContentFieldId();
    const props = [
      `type: ${this.getRootFolderType()}`,
      `domain: ${this.getCategoryType()}`,
      `${creatorFieldId}: ${values[creatorFieldId]}`,
      `${contentFieldId}: "${values[contentFieldId]}"`,
    ];
    return props;
  }
}

module.exports = SynthesisBuilder;
