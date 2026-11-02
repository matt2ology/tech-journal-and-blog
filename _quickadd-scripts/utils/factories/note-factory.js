const BookNoteBuilder = require("../domains/book-note-builder");
const CourseNoteBuilder = require("../domains/course-note-builder");

/**
 * Main orchestrator and factory for Note frontmatter generation.
 */
class NoteFactory {
  #quickAddApi;
  #builders;

  constructor(quickAddApi) {
    if (!quickAddApi || typeof quickAddApi.requestInputs !== "function") {
      throw new TypeError(
        "NoteFactory requires a QuickAdd API with requestInputs().",
      );
    }
    this.#quickAddApi = quickAddApi;

    // Register builder instances indexed by domain key
    this.#builders = {
      book: new BookNoteBuilder(quickAddApi),
      course: new CourseNoteBuilder(quickAddApi),
    };
  }

  /**
   * Prompts user for domain choice and delegates to the matching builder.
   */
  async run(params) {
    const domainKeys = Object.keys(this.#builders);
    const domainLabels = domainKeys.map(
      (key) => key.charAt(0).toUpperCase() + key.slice(1),
    );

    const chosenDomainKey = await this.#quickAddApi.suggester(
      domainLabels,
      domainKeys,
    );

    if (!chosenDomainKey) {
      throw new Error("Note domain selection cancelled.");
    }

    const selectedBuilder = this.#builders[chosenDomainKey];
    return await selectedBuilder.run(params);
  }
}

module.exports = NoteFactory;
