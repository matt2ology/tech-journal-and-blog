const SynthesisBuilderBook = require("../domains/book-synthesis-builder");
const SynthesisBuilderCourse = require("../domains/course-synthesis-builder");

/**
 * Main orchestrator and factory for synthesis frontmatter generation.
 */
class SynthesisFactory {
  #quickAddApi;
  #builders;

  constructor(quickAddApi) {
    if (!quickAddApi || typeof quickAddApi.requestInputs !== "function") {
      throw new TypeError(
        "SynthesisFactory requires a QuickAdd API with requestInputs().",
      );
    }
    this.#quickAddApi = quickAddApi;

    // Register builder instances indexed by domain key
    this.#builders = {
      books: new SynthesisBuilderBook(quickAddApi),
      courses: new SynthesisBuilderCourse(quickAddApi),
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
      throw new Error("Synthesis domain selection cancelled.");
    }

    const selectedBuilder = this.#builders[chosenDomainKey];
    return await selectedBuilder.run(params);
  }
}

module.exports = SynthesisFactory;
