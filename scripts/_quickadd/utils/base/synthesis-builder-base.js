const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const FrontmatterBuilderBase = require(
  path.join(
    vaultPath,
    "scripts",
    "_quickadd",
    "utils",
    "frontmatter-builder-base",
  ),
);
const TextFormatter = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "text-formatter"),
);
const VaultQueryService = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "vault-query-service"),
);

/**
 * Base class encapsulating shared workflow behavior for all synthesis domains,
 * automatically pulling creator values from corresponding analysis folders.
 */
class SynthesisBuilderBase extends FrontmatterBuilderBase {
  constructor(quickAddApi) {
    super(quickAddApi);
  }

  // --- Template Hooks to be implemented by derived classes ---
  getCategoryType() {
    throw new Error("Derived classes must implement getCategoryType()");
  }

  getCreatorFieldId() {
    throw new Error("Derived classes must implement getCreatorFieldId()");
  }

  getCreatorFieldLabel() {
    throw new Error("Derived classes must implement getCreatorFieldLabel()");
  }

  getContentFieldId() {
    throw new Error("Derived classes must implement getContentFieldId()");
  }

  getContentFieldLabel() {
    throw new Error("Derived classes must implement getContentFieldLabel()");
  }

  // --- Shared Implementation ---

  getFields() {
    // Populate suggester options from existing analysis folders
    const rawContentOptions = VaultQueryService.getSubfolderNames({
      app,
      folderPath: `analysis/${this.getCategoryType()}`,
    });
    const processedContentOptions = rawContentOptions.map((option) =>
      TextFormatter.titleCase(option),
    );

    return [
      {
        id: this.getContentFieldId(),
        label: this.getContentFieldLabel(),
        type: "suggester",
        options: processedContentOptions,
        placeholder: "Enter title or select existing analysis folder",
        defaultValue: "",
        suggesterConfig: {
          displayValues: processedContentOptions,
          allowCustomInput: true,
          caseSensitive: false,
          multiSelect: false,
        },
      },
      {
        id: this.getCreatorFieldId(),
        label: this.getCreatorFieldLabel(),
        type: "text",
        placeholder: "Enter name(s) (auto-fills from analysis if blank)",
        defaultValue: "",
      },
    ];
  }

  /**
   * Resolves whether the content title matches an existing analysis subfolder.
   * Auto-fills creator from existing analysis notes if blank.
   *
   * @param {Object} options - { formattedContent, creatorInput }
   * @returns {Object} { creatorInput }
   */
  #resolveContentContext({ formattedContent, creatorInput }) {
    const rootFolder = `analysis/${this.getCategoryType()}`;
    const subfolders = VaultQueryService.getSubfolderNames({
      app,
      folderPath: rootFolder,
    });

    const matchedSubfolder = subfolders.find(
      (sub) =>
        TextFormatter.titleCase(sub) === formattedContent ||
        sub.toLowerCase() === formattedContent.toLowerCase(),
    );

    if (!matchedSubfolder) {
      return { creatorInput };
    }

    let resolvedCreator = creatorInput;
    if (!resolvedCreator) {
      const contentFolderPath = `${rootFolder}/${matchedSubfolder}`;
      const existingCreators = VaultQueryService.getFieldValues({
        app,
        fieldName: this.getCreatorFieldId(),
        folderPath: contentFolderPath,
      });

      if (existingCreators.length > 0) {
        resolvedCreator = existingCreators
          .map((creator) => TextFormatter.cleanWikiLink(creator))
          .join(", ");
      }
    }

    return {
      creatorInput: resolvedCreator,
    };
  }

  processValues(values) {
    const baseProcessedValues = super.processValues(values);
    const creatorFieldId = this.getCreatorFieldId();
    const contentFieldId = this.getContentFieldId();

    const creatorInput = values[creatorFieldId] || "";
    const contentInput = values[contentFieldId] || "";

    const extractedTitle =
      typeof TextFormatter.extractBeforeColon === "function"
        ? TextFormatter.extractBeforeColon(contentInput)
        : contentInput.split(":")[0].trim();

    const formattedContentTitle = TextFormatter.titleCase(extractedTitle);
    const generatedFolderName = TextFormatter.slugify(extractedTitle);

    // Resolve context to auto-fill creator from analysis folder if blank
    const context = this.#resolveContentContext({
      formattedContent: formattedContentTitle,
      creatorInput,
    });

    const resolvedCreatorInput = context.creatorInput;

    const generatedFilename = `00-${generatedFolderName}-synthesis`;
    const generatedTitle = TextFormatter.titleCase(
      `Synthesis of ${extractedTitle}`,
    );

    const updatedCategories = this.appendToList({
      list: values.categories,
      items: ["synthesis", this.getCategoryType()],
    });

    return {
      ...baseProcessedValues,
      aliases: `"${contentInput} Synthesis"`,
      title: generatedTitle,
      slug: generatedFolderName,
      type: `${this.getCategoryType()}`,
      folder: generatedFolderName,
      filename: generatedFilename,
      categories: updatedCategories,
      [creatorFieldId]: this.formatNameList(
        resolvedCreatorInput,
        `Unknown ${this.getCreatorFieldLabel()}`,
      ),
    };
  }

  buildExtraProperties({ values }) {
    const creatorFieldId = this.getCreatorFieldId();
    const contentFieldId = this.getContentFieldId();

    return [
      `${creatorFieldId}: ${values[creatorFieldId]}`,
      `${contentFieldId}: "${values[contentFieldId]}"`,
    ];
  }
}

module.exports = SynthesisBuilderBase;
