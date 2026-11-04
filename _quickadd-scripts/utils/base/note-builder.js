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

  // Extract Method: Standardized organization string construction
  #buildContentOrganization(unitValue, sectionValue) {
    if (sectionValue) {
      return `${unitValue} - ${sectionValue}`;
    }
    return `${unitValue}`;
  }

  // Extract Method / Decompose Conditional: Note header fallback
  #resolveNoteHeader(sectionValue, unitValue) {
    if (sectionValue) {
      return sectionValue;
    }
    return unitValue || "Notes & Key Points";
  }

  // Extract Method / Decompose Conditional: Title construction logic
  #buildGeneratedTitle(contentMainTitle, contentOrganization, hasUnit) {
    if (hasUnit) {
      return `${contentMainTitle} - ${contentOrganization}`;
    }
    return `${contentMainTitle}`;
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

    const contentOrganization = this.#buildContentOrganization(
      unitValue,
      sectionValue,
    );
    const contentMainTitle = TextFormatter.extractBeforeColon(contentInput);
    const generatedFolderName = TextFormatter.slugify(contentMainTitle);

    const context = this.resolveContentContext({
      formattedContent: contentMainTitle,
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
    const generatedTitle = this.#buildGeneratedTitle(
      contentMainTitle,
      contentOrganization,
      Boolean(unitValue),
    );

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
      categories: this.appendToList({
        list: values.categories,
        items: ["notes", this.getCategoryType()],
      }),
      [creatorFieldId]: this.formatNameList(
        context.creatorInput,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
      note_header: this.#resolveNoteHeader(sectionValue, unitValue),
      reference_links: `${contentMainTitle} - [[${generatedFilename}|${contentOrganization}]]`,
    };
  }

  buildExtraProperties({ values }) {
    return [
      `note_type: ${this.getRootFolderType()}`,
      `domain: ${this.getCategoryType()}`,
      `${this.getCreatorFieldId()}: ${values[this.getCreatorFieldId()]}`,
      `${this.getContentFieldId()}: "${values[this.getContentFieldId()]}"`,
      `${this.getUnitFieldId()}: "${values[this.getUnitFieldId()]}"`,
      `${this.getSectionFieldId()}: "${values[this.getSectionFieldId()]}"`,
    ];
  }
}

module.exports = NoteBuilder;
