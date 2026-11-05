const ContentBuilderBase = require("./content-builder-base");
const FileCounterUtility = require("../helpers/file-counter-utility");
const TextFormatter = require("../helpers/text-formatter");

class NoteBuilder extends ContentBuilderBase {
  getContentType() {
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
    const creatorInput = values[creatorFieldId] || "";
    const contentInput = values[contentFieldId] || "";

    const contentOrganization = sectionValue
      ? `${unitValue} - ${sectionValue}`
      : unitValue;
    const contentMainTitle = TextFormatter.extractBeforeColon(contentInput);
    const generatedFolderName = TextFormatter.slugify(contentMainTitle);

    const context = this.resolveContentContext({
      formattedContent: TextFormatter.titleCase(contentMainTitle),
      creatorInput,
    });

    const fileIndex = FileCounterUtility.getCount({
      app,
      folderPath: `notes/${this.getCategoryType()}/${generatedFolderName}`,
      includeNext: true,
    });

    const formattedUnit = this.formatUnitIdentifier(unitValue);
    const generatedFilename = TextFormatter.slugifyAdjacent(
      `n${fileIndex} ${contentMainTitle} ${formattedUnit} ${sectionValue}`,
    );
    const generatedTitle = unitValue
      ? `${contentMainTitle} - ${contentOrganization}`
      : contentMainTitle;

    return {
      ...baseProcessedValues,
      aliases: TextFormatter.titleCase(
        `${contentMainTitle} - ${contentOrganization}`,
      ),
      title: TextFormatter.titleCase(`Notes on ${generatedTitle}`),
      slug: TextFormatter.slugifyWithAbbreviations(
        `${contentMainTitle} - ${contentOrganization}`,
      ),
      type: this.getContentType(),
      folder: generatedFolderName,
      filename: generatedFilename,
      categories: this.appendToList({
        list: values.categories,
        items: [this.getContentType()],
      }),
      [creatorFieldId]: this.formatNameList(
        context.creatorInput,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
      note_header: sectionValue || unitValue || "Notes & Key Points",
      reference_links: `${contentMainTitle} - [[${generatedFilename}|${contentOrganization}]]`,
    };
  }

  buildExtraProperties({ values }) {
    return [
      `type: ${this.getContentType()}`,
      `domain: ${this.getCategoryType()}`,
      `${this.getCreatorFieldId()}: ${values[this.getCreatorFieldId()]}`,
      `${this.getContentFieldId()}: "${values[this.getContentFieldId()]}"`,
      `${this.getUnitFieldId()}: "${values[this.getUnitFieldId()]}"`,
      `${this.getSectionFieldId()}: "${values[this.getSectionFieldId()]}"`,
    ];
  }
}

module.exports = NoteBuilder;
