const ContentBuilderBase = require("../base/content-builder-base");
const FileCounterUtility = require("../helpers/file-counter-utility");
const TextFormatter = require("../helpers/text-formatter");

class NoteBuilderBase extends ContentBuilderBase {
  constructor(quickAddApi) {
    super(quickAddApi);
  }

  getRootFolderType() {
    return "notes";
  }

  processValues(values) {
    const baseProcessedValues = super.processValues(values);
    const creatorFieldId = this.getCreatorFieldId();
    const contentFieldId = this.getContentFieldId();
    const sectionFieldId = this.getSectionFieldId();
    const unitFieldId = this.getUnitFieldId();

    const unitValue = values[unitFieldId] || "";
    const sectionValue = values[sectionFieldId] || "";
    const contentOrganization = sectionValue
      ? `${unitValue} - ${sectionValue}`
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

    const notesFolderPath = `notes/${this.getCategoryType()}/${generatedFolderName}`;
    const fileIndex = FileCounterUtility.getCount({
      app,
      folderPath: notesFolderPath,
      includeNext: true,
    });

    const formattedUnit = this.formatUnitIdentifier(unitValue);
    const generatedFilename = TextFormatter.slugifyAdjacent(
      `n${fileIndex} ${extractedTitle} ${formattedUnit} ${sectionValue}`,
    );

    const generatedTitle = unitValue
      ? TextFormatter.titleCase(`Notes on ${extractedTitle} - ${unitValue}`)
      : TextFormatter.titleCase(`Notes on ${extractedTitle}`);

    const updatedCategories = this.appendToList({
      list: values.categories,
      items: ["notes", this.getCategoryType()],
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
      note_header: sectionValue || unitValue || "Notes & Key Points",
      reference_links: `${extractedTitle} - [[${generatedFilename}|${contentOrganization}]]`,
    };
  }

  buildExtraProperties({ values }) {
    return [
      `${this.getCreatorFieldId()}: ${values[this.getCreatorFieldId()]}`,
      `${this.getContentFieldId()}: "${values[this.getContentFieldId()]}"`,
      `${this.getUnitFieldId()}: "${values[this.getUnitFieldId()]}"`,
      `${this.getSectionFieldId()}: "${values[this.getSectionFieldId()]}"`,
    ];
  }
}

module.exports = NoteBuilderBase;
