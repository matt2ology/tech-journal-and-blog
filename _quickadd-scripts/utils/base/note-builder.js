const HierarchicalContentBuilderBase = require("./hierarchical-content-builder-base");
const FileCounterUtility = require("../helpers/file-counter-utility");
const TextFormatter = require("../helpers/text-formatter");

class NoteBuilder extends HierarchicalContentBuilderBase {
  getKnowledgeResourceType() {
    return "notes";
  }

  getSectionFieldId() {
    return "section";
  }

  getUnitFieldId() {
    return "unit";
  }

  processValues(values) {
    const baseProcessedValues = super.processValues(values);
    const {
      creatorFieldId,
      creatorInput,
      contentInput,
      unitValue,
      sectionValue,
    } = this.extractContentFields(values);

    const fileIndex = FileCounterUtility.getCount({
      app,
      folderPath: baseProcessedValues.folderPath,
      includeNext: true,
    });

    const contentMainTitle = TextFormatter.extractBeforeColon(contentInput);
    const contentUnitTitleCase = TextFormatter.titleCase(unitValue);
    const contentUnitFormatted = this.formatUnitIdentifier(unitValue);
    const contentSectionFormatted = this.formatUnitIdentifier(sectionValue);
    const fileIndexAnalysis = FileCounterUtility.getCount({
      app,
      folderPath: `analysis/${this.getDomainType()}/${TextFormatter.slugify(contentMainTitle)}`,
      includeNext: true,
    });
    const analysisFileName = TextFormatter.slugifyAdjacent(
      [`${fileIndexAnalysis}`, contentMainTitle, contentUnitFormatted]
        .filter(Boolean)
        .join(" "),
    );

    const analysisNoteTitle = [
      TextFormatter.titleCase(contentInput),
      TextFormatter.titleCase(contentUnitTitleCase),
    ]
      .filter(Boolean)
      .join(" - ");

    const captureNoteFilename = TextFormatter.slugifyAdjacent(
      [
        `n${fileIndex}`,
        contentMainTitle,
        contentUnitFormatted,
        contentSectionFormatted,
      ]
        .filter(Boolean)
        .join(" "),
    );

    const captureNoteTitle = [
      contentMainTitle,
      contentUnitTitleCase,
      sectionValue,
    ]
      .filter(Boolean)
      .join(" - ");

    const { creatorInput: resolvedCreator } = this.resolveContentContext({
      formattedContent: TextFormatter.titleCase(contentMainTitle),
      creatorInput,
    });

    return {
      ...baseProcessedValues,
      aliases: TextFormatter.titleCase(`Notes on ${captureNoteTitle}`),
      title: TextFormatter.titleCase(`Notes on ${captureNoteTitle}`),
      slug: TextFormatter.slugifyWithAbbreviations(`${captureNoteTitle}`),
      type: this.getKnowledgeResourceType(),
      filename: captureNoteFilename,
      categories: this.appendToList({
        list: values.categories,
        items: [this.getKnowledgeResourceType()],
      }),
      [creatorFieldId]: this.formatNameListInput(
        resolvedCreator,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
      note_header: sectionValue || unitValue || "Notes & Key Points",
      information_processing: `[[${analysisFileName}|${analysisNoteTitle}]]`,
    };
  }

  buildExtraProperties({ values }) {
    return [
      `type: ${this.getKnowledgeResourceType()}`,
      `domain: ${this.getDomainType()}`,
      `${this.getCreatorFieldId()}: ${values[this.getCreatorFieldId()]}`,
      `${this.getContentFieldId()}: "${values[this.getContentFieldId()]}"`,
      `${this.getUnitFieldId()}: "${values[this.getUnitFieldId()]}"`,
      `${this.getSectionFieldId()}: "${values[this.getSectionFieldId()]}"`,
    ];
  }
}

module.exports = NoteBuilder;
