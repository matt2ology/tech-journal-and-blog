const ContentBuilderBase = require("./content-builder-base");
const FileCounterUtility = require("../helpers/file-counter-utility");
const TextFormatter = require("../helpers/text-formatter");

class AnalysisBuilder extends ContentBuilderBase {
  constructor(quickAddApi) {
    super(quickAddApi);
  }

  getRootFolderType() {
    return "notes";
  }

  formatUnitIdentifier(text) {
    return text.replace(
      /^(?:Chapter\s+)?(\d+)(?:\.(\d+))?\s*:?\s*/,
      (_, major, minor) =>
        `ch${major.padStart(2, "0")}${minor ? "-" + minor.padStart(2, "0") : ""}: `,
    );
  }

  processValues(values) {
    const baseProcessedValues = super.processValues(values);
    const creatorFieldId = this.getCreatorFieldId();
    const contentFieldId = this.getContentFieldId();
    const sectionFieldId = this.getSectionFieldId();
    const unitFieldId = this.getUnitFieldId();

    const sectionValue = values[sectionFieldId];
    const unitValue = values[unitFieldId] || "";
    const contentOrganization = sectionValue
      ? `${sectionValue} - ${unitValue}`
      : `${unitValue}`;

    const creatorInput = values[creatorFieldId] || "";
    const contentInput = values[contentFieldId] || "";

    const extractedTitle = TextFormatter.extractBeforeColon(contentInput);
    const formattedContentTitle = TextFormatter.titleCase(extractedTitle);
    const generatedFolderName = TextFormatter.slugify(extractedTitle);

    const context = this.resolveContentContext({
      formattedContent: formattedContentTitle,
      creatorInput,
    });

    // FileCounterUtility is actively used here for the analysis folder path
    const analysisFolderPath = `analysis/${this.getCategoryType()}/${generatedFolderName}`;
    const fileIndex = FileCounterUtility.getCount({
      app,
      folderPath: analysisFolderPath,
      includeNext: true,
    });

    const formattedUnit = this.formatUnitIdentifier(unitValue);
    const generatedFilename = TextFormatter.slugify(
      `${fileIndex} ${extractedTitle} ${formattedUnit}`,
    );
    const generatedCaptureNoteFilename = TextFormatter.slugify(
      `n${fileIndex} ${extractedTitle} ${formattedUnit} ${sectionValue}`,
    );
    const generatedTitle = TextFormatter.titleCase(
      `Analysis of ${extractedTitle} - ${unitValue}`,
    );

    const updatedCategories = this.appendToList({
      list: values.categories,
      items: ["analysis", this.getCategoryType()],
    });

    return {
      ...baseProcessedValues,
      aliases: `"${formattedContentTitle} - ${unitValue}"`,
      title: generatedTitle,
      slug: TextFormatter.slugify(`${extractedTitle} - ${formattedUnit}`),
      type: this.getCategoryType(),
      folder: generatedFolderName,
      filename: generatedFilename,
      categories: updatedCategories,
      [creatorFieldId]: this.formatNameList(
        context.creatorInput,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
      reference_links: `[[00-${generatedFolderName}-synthesis|${extractedTitle}]] - [[${generatedCaptureNoteFilename}|${contentOrganization}]]`,
    };
  }

  buildExtraProperties({ values }) {
    return [
      `${this.getCreatorFieldId()}: ${values[this.getCreatorFieldId()]}`,
      `${this.getContentFieldId()}: "${values[this.getContentFieldId()]}"`,
      `${this.getUnitFieldId()}: "${values[this.getUnitFieldId()]}"`,
    ];
  }
}

module.exports = AnalysisBuilder;
