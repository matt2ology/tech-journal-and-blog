const ContentBuilderBase = require("./content-builder-base");
const TextFormatter = require("../helpers/text-formatter");
const VaultQueryService = require("../services/vault-query-service");

class SynthesisBuilder extends ContentBuilderBase {
  getFields() {
    const rootFolder = `analysis/${this.getCategoryType()}`;
    const rawContentOptions = VaultQueryService.getSubfolderNames({
      app,
      folderPath: rootFolder,
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

    const context = this.resolveContentContext({
      formattedContent: formattedContentTitle,
      creatorInput,
      customRootFolder: `analysis/${this.getCategoryType()}`,
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
      `type: ${this.getRootFolderType()}`,
      `domain: ${this.getCategoryType()}`,
      `${creatorFieldId}: ${values[creatorFieldId]}`,
      `${contentFieldId}: "${values[contentFieldId]}"`,
    ];
  }
}

module.exports = SynthesisBuilder;
