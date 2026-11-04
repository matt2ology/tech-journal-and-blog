const ContentBuilderBase = require("./content-builder-base");
const FileCounterUtility = require("../helpers/file-counter-utility");
const TextFormatter = require("../helpers/text-formatter");

class NoteBuilder extends ContentBuilderBase {
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

    const contentMainTitle = TextFormatter.extractBeforeColon(contentInput);
    const generatedFolderName = TextFormatter.slugify(contentMainTitle);

    const context = this.resolveContentContext({
      formattedContent: contentMainTitle,
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
      `n${fileIndex} ${contentMainTitle} ${formattedUnit} ${sectionValue}`,
    );

    const generatedTitle = unitValue
      ? `${contentMainTitle} - ${contentOrganization}`
      : `${contentMainTitle}`;

    const updatedCategories = this.appendToList({
      list: values.categories,
      items: ["notes", this.getCategoryType()],
    });

    return {
      ...baseProcessedValues,
      aliases: TextFormatter.titleCase(
        `${contentMainTitle} - ${contentOrganization}`,
      ),
      title: TextFormatter.titleCase(`Notes on ${generatedTitle}`),
      slug: TextFormatter.slugify(
        `${contentMainTitle} - ${contentOrganization}`,
      ),
      type: this.getCategoryType(),
      folder: generatedFolderName,
      filename: generatedFilename,
      categories: updatedCategories,
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
      `${this.getCreatorFieldId()}: ${values[this.getCreatorFieldId()]}`,
      `${this.getContentFieldId()}: "${values[this.getContentFieldId()]}"`,
      `${this.getUnitFieldId()}: "${values[this.getUnitFieldId()]}"`,
      `${this.getSectionFieldId()}: "${values[this.getSectionFieldId()]}"`,
    ];
  }
}

module.exports = NoteBuilder;
