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
      sectionValue,
      unitValue,
    } = this.extractContentFields(values);

    const contentMainTitle = TextFormatter.extractBeforeColon(contentInput);
    const contentOrganization = sectionValue
      ? `${unitValue} - ${sectionValue}`
      : unitValue;

    const { creatorInput: resolvedCreator } = this.resolveContentContext({
      formattedContent: TextFormatter.titleCase(contentMainTitle),
      creatorInput,
    });

    const fileIndex = FileCounterUtility.getCount({
      app,
      folderPath: baseProcessedValues.folderPath,
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
      aliases: TextFormatter.titleCase(`Notes on ${generatedTitle}`),
      title: TextFormatter.titleCase(`Notes on ${generatedTitle}`),
      slug: TextFormatter.slugifyWithAbbreviations(
        `${contentMainTitle} - ${contentOrganization}`,
      ),
      type: this.getKnowledgeResourceType(),
      filename: generatedFilename,
      categories: this.appendToList({
        list: values.categories,
        items: [this.getKnowledgeResourceType()],
      }),
      [creatorFieldId]: this.formatNameListInput(
        resolvedCreator,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
      note_header: sectionValue || unitValue || "Notes & Key Points",
      reference_links: `${contentMainTitle} - [[${generatedFilename}|${contentOrganization}]]`,
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
