const AnalysisBuilderBook = require("../domains/book-analysis-builder");
const AnalysisBuilderCourse = require("../domains/course-analysis-builder");

/**
 * Main orchestrator and factory for analysis frontmatter generation.
 */
class AnalysisFactory {
  #quickAddApi;
  #builders;

  constructor(quickAddApi) {
    if (!quickAddApi || typeof quickAddApi.requestInputs !== "function") {
      throw new TypeError(
        "AnalysisFactory requires a QuickAdd API with requestInputs().",
      );
    }
    this.#quickAddApi = quickAddApi;

    // Register builder instances indexed by domain key
    this.#builders = {
      books: new AnalysisBuilderBook(quickAddApi),
      courses: new AnalysisBuilderCourse(quickAddApi),
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
      throw new Error("Analysis domain selection cancelled.");
    }

    const selectedBuilder = this.#builders[chosenDomainKey];
    return await selectedBuilder.run(params);
  }
}

module.exports = AnalysisFactory;
