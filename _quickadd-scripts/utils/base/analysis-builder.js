const ContentBuilderBase = require("./content-builder-base");
const FileCounterUtility = require("../helpers/file-counter-utility");
const TextFormatter = require("../helpers/text-formatter");

class AnalysisBuilder extends ContentBuilderBase {
  getContentType() {
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
    const creatorFieldId = this.getCreatorFieldId();
    const contentFieldId = this.getContentFieldId();
    const sectionFieldId = this.getSectionFieldId();
    const unitFieldId = this.getUnitFieldId();

    const sectionValue = values[sectionFieldId] || "";
    const unitValue = values[unitFieldId] || "";
    const creatorInput = values[creatorFieldId] || "";
    const contentInput = values[contentFieldId] || "";

    const contentOrganization = sectionValue
      ? `${sectionValue} - ${unitValue}`
      : unitValue;
    const extractedTitle = TextFormatter.extractBeforeColon(contentInput);
    const formattedContentTitle = TextFormatter.titleCase(extractedTitle);
    const generatedFolderName = TextFormatter.slugify(extractedTitle);

    const context = this.resolveContentContext({
      formattedContent: formattedContentTitle,
      creatorInput,
    });

    const fileIndex = FileCounterUtility.getCount({
      app,
      folderPath: `analysis/${this.getCategoryType()}/${generatedFolderName}`,
      includeNext: true,
    });

    const formattedUnit = this.formatUnitIdentifier(unitValue);
    const generatedFilename = TextFormatter.slugify(
      `${fileIndex} ${extractedTitle} ${formattedUnit}`,
    );
    const generatedCaptureNoteFilename = TextFormatter.slugify(
      `n${fileIndex} ${extractedTitle} ${formattedUnit} ${sectionValue}`,
    );

    return {
      ...baseProcessedValues,
      aliases: TextFormatter.titleCase(
        `${formattedContentTitle} - ${unitValue}`,
      ),
      title: TextFormatter.titleCase(
        `Analysis of ${extractedTitle} - ${unitValue}`,
      ),
      slug: TextFormatter.slugify(`${extractedTitle} - ${formattedUnit}`),
      type: this.getContentType(),
      folder: generatedFolderName,
      filename: generatedFilename,
      categories: this.appendToList({
        list: values.categories,
        items: ["analysis", this.getCategoryType()],
      }),
      [creatorFieldId]: this.formatNameList(
        context.creatorInput,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
      reference_links: `[[00-${generatedFolderName}-synthesis|${extractedTitle}]] - [[${generatedCaptureNoteFilename}|${contentOrganization}]]`,
    };
  }

  buildExtraProperties({ values }) {
    return [
      `type: ${this.getContentType()}`,
      `domain: ${this.getCategoryType()}`,
      `${this.getCreatorFieldId()}: ${values[this.getCreatorFieldId()]}`,
      `${this.getContentFieldId()}: "${values[this.getContentFieldId()]}"`,
      `${this.getUnitFieldId()}: "${values[this.getUnitFieldId()]}"`,
    ];
  }
}

module.exports = AnalysisBuilder;
