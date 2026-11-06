const ContentBuilderBase = require("./content-builder-base");
const FileCounterUtility = require("../helpers/file-counter-utility");
const TextFormatter = require("../helpers/text-formatter");

class AnalysisBuilder extends ContentBuilderBase {
  getKnowledgeResourceType() {
    return "analysis";
  }

  formatUnitIdentifier(text) {
    const chapterRegex = /^(?:Chapter\s+)?(\d+)(?:\.(\d+))?\s*:?\s*/;
    return text.replace(chapterRegex, (_, major, minor) =>
      minor
        ? `ch${major.padStart(2, "0")}-${minor.padStart(2, "0")}: `
        : `ch${major.padStart(2, "0")}: `,
    );
  }

  processValues(values) {
    const baseProcessedValues = super.processValues(values);
    const {
      creatorFieldId,
      creatorInput,
      contentInput,
      sectionValue,
      unitValue,
    } = this.extractContentFields(values);

    const extractedTitle = TextFormatter.extractBeforeColon(contentInput);
    const formattedContentTitle = TextFormatter.titleCase(extractedTitle);
    const generatedFolderName = TextFormatter.slugify(extractedTitle);
    const contentOrganization = sectionValue
      ? `${sectionValue} - ${unitValue}`
      : unitValue;

    const { creatorInput: resolvedCreator } = this.resolveContentContext({
      formattedContent: formattedContentTitle,
      creatorInput,
    });

    const fileIndex = FileCounterUtility.getCount({
      app,
      folderPath: `analysis/${this.getDomainType()}/${generatedFolderName}`,
      includeNext: true,
    });

    const formattedUnit = this.formatUnitIdentifier(unitValue);
    const generatedFilename = TextFormatter.slugify(
      `${fileIndex} ${extractedTitle} ${formattedUnit}`,
    );
    const captureNoteFilename = TextFormatter.slugify(
      `n${fileIndex} ${extractedTitle} ${formattedUnit} ${sectionValue}`,
    );

    return {
      ...baseProcessedValues,
      aliases: TextFormatter.titleCase(
        `Analysis of ${extractedTitle} - ${unitValue}`,
      ),
      title: TextFormatter.titleCase(
        `Analysis of ${extractedTitle} - ${unitValue}`,
      ),
      slug: TextFormatter.slugifyWithAbbreviations(
        `${extractedTitle} - ${formattedUnit}`,
      ),
      type: this.getKnowledgeResourceType(),
      folder: generatedFolderName,
      filename: generatedFilename,
      categories: this.appendToList({
        list: values.categories,
        items: ["analysis", this.getDomainType()],
      }),
      [creatorFieldId]: this.formatNameListInput(
        resolvedCreator,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
      reference_links: `[[00-${generatedFolderName}-synthesis|${extractedTitle}]] - [[${captureNoteFilename}|${contentOrganization}]]`,
    };
  }

  buildExtraProperties({ values }) {
    return [
      `type: ${this.getKnowledgeResourceType()}`,
      `domain: ${this.getDomainType()}`,
      `${this.getCreatorFieldId()}: ${values[this.getCreatorFieldId()]}`,
      `${this.getContentFieldId()}: "${values[this.getContentFieldId()]}"`,
      `${this.getUnitFieldId()}: "${values[this.getUnitFieldId()]}"`,
    ];
  }
}

module.exports = AnalysisBuilder;
