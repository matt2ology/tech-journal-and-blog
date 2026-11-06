const ContentBuilderBase = require("./content-builder-base");
const TextFormatter = require("../helpers/text-formatter");
const VaultQueryService = require("../services/vault-query-service");

class SynthesisBuilder extends ContentBuilderBase {
  getKnowledgeResourceType() {
    return "synthesis";
  }

  getFields() {
    const rootFolder = `analysis/${this.getDomainType()}`;
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
    const { creatorFieldId, creatorInput, contentInput } =
      this.extractContentFields(values);

    const baseTitle = TextFormatter.extractBeforeColon
      ? TextFormatter.extractBeforeColon(contentInput)
      : contentInput.split(":")[0].trim();
    const formattedBaseTitle = TextFormatter.titleCase(baseTitle);

    const { creatorInput: resolvedCreator } = this.resolveContentContext({
      formattedContent: formattedBaseTitle,
      creatorInput,
      customRootFolder: `analysis/${this.getDomainType()}`,
    });

    const generatedFolderPath = `${this.getKnowledgeResourceType()}/${this.getDomainType()}/${TextFormatter.slugify(baseTitle)}`;

    const baseProcessedValues = super.processValues({
      ...values,
      folderPath: generatedFolderPath,
    });

    return {
      ...baseProcessedValues,
      aliases: TextFormatter.titleCase(`Synthesis of ${baseTitle}`),
      title: TextFormatter.titleCase(`Synthesis of ${baseTitle}`),
      slug: TextFormatter.slugifyWithAbbreviations(baseTitle),
      type: this.getKnowledgeResourceType(),
      filename: TextFormatter.slugifyWithAbbreviations(
        `00-${baseTitle}-synthesis`,
      ),
      categories: this.appendToList({
        list: values.categories,
        items: ["synthesis", this.getDomainType()],
      }),
      [creatorFieldId]: this.formatNameListInput(
        resolvedCreator,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
    };
  }

  buildExtraProperties({ values }) {
    const creatorFieldId = this.getCreatorFieldId();
    const contentFieldId = this.getContentFieldId();
    return [
      `type: ${this.getKnowledgeResourceType()}`,
      `domain: ${this.getDomainType()}`,
      `${creatorFieldId}: ${values[creatorFieldId]}`,
      `${contentFieldId}: "${values[contentFieldId]}"`,
    ];
  }
}

module.exports = SynthesisBuilder;
