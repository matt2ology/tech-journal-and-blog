const HierarchicalContentBuilderBase = require("./hierarchical-content-builder-base");
const FileCounterUtility = require("../helpers/file-counter-utility");
const TextFormatter = require("../helpers/text-formatter");

class AnalysisBuilder extends HierarchicalContentBuilderBase {
  getKnowledgeResourceType() {
    return "analysis";
  }

  getSectionFieldId() {
    return "section";
  }

  getUnitFieldId() {
    return "unit";
  }

  /**
   * Formats a unit identifier string by normalizing chapter and sub-chapter prefixes.
   * Matches patterns like "Chapter 1", "1.2", or "Chapter 3:" at the beginning of the text
   * and converts them into a standardized, zero-padded format (e.g., "ch01: " or "ch01-02: ").
   *
   * @param {string} text - The input string containing the chapter or unit prefix.
   * @returns {string} The text with the formatted and normalized unit identifier.
   */
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

    const fileIndex = FileCounterUtility.getCount({
      app,
      folderPath: baseProcessedValues.folderPath,
      includeNext: true,
    });

    const contentMainTitle = TextFormatter.extractBeforeColon(contentInput);
    const contentOrganization = [unitValue, sectionValue]
      .filter(Boolean)
      .join(" - ");

    const formattedUnit = this.formatUnitIdentifier(unitValue);
    const analysisFileName = TextFormatter.slugifyAdjacent(
      [`${fileIndex}`, contentMainTitle, formattedUnit]
        .filter(Boolean)
        .join(" "),
    );

    const generatedTitle = [contentMainTitle, contentOrganization]
      .filter(Boolean)
      .join(" - ");

    const { creatorInput: resolvedCreator } = this.resolveContentContext({
      formattedContent: contentMainTitle,
      creatorInput,
    });

    return {
      ...baseProcessedValues,
      aliases: TextFormatter.titleCase(`Analysis of ${generatedTitle}`),
      title: TextFormatter.titleCase(`Analysis of ${generatedTitle}`),
      slug: TextFormatter.slugifyWithAbbreviations(
        `${contentMainTitle} - ${formattedUnit}`,
      ),
      type: this.getKnowledgeResourceType(),
      filename: analysisFileName,
      categories: this.appendToList({
        list: values.categories,
        items: ["analysis"],
      }),
      [creatorFieldId]: this.formatNameListInput(
        resolvedCreator,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
      information_processing: `[[00-${TextFormatter.slugify(contentMainTitle)}-synthesis|${contentMainTitle}]]`,
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
