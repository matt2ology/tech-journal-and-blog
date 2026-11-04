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

  // Decompose Conditional / Extract Method: Unit identifier string formatting
  formatUnitIdentifier(text) {
    const chapterRegex = /^(?:Chapter\s+)?(\d+)(?:\.(\d+))?\s*:?\s*/;
    return text.replace(chapterRegex, (_, major, minor) =>
      this.#formatChapterPrefix(major, minor),
    );
  }

  #formatChapterPrefix(major, minor) {
    if (minor) {
      return `ch${major.padStart(2, "0")}-${minor.padStart(2, "0")}: `;
    }
    return `ch${major.padStart(2, "0")}: `;
  }

  // Extract Method: Standardized organization structure
  #buildContentOrganization(sectionValue, unitValue) {
    if (sectionValue) {
      return `${sectionValue} - ${unitValue}`;
    }
    return `${unitValue}`;
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

    const contentOrganization = this.#buildContentOrganization(
      sectionValue,
      unitValue,
    );
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
      aliases: `"${formattedContentTitle} - ${unitValue}"`,
      title: TextFormatter.titleCase(
        `Analysis of ${extractedTitle} - ${unitValue}`,
      ),
      slug: TextFormatter.slugify(`${extractedTitle} - ${formattedUnit}`),
      type: this.getCategoryType(),
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
      `note_type: ${this.getRootFolderType()}`,
      `domain: ${this.getCategoryType()}`,
      `${this.getCreatorFieldId()}: ${values[this.getCreatorFieldId()]}`,
      `${this.getContentFieldId()}: "${values[this.getContentFieldId()]}"`,
      `${this.getUnitFieldId()}: "${values[this.getUnitFieldId()]}"`,
    ];
  }
}

module.exports = AnalysisBuilder;
