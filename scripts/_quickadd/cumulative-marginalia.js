module.exports = async ({ quickAddApi: qa, variables, abort }) => {
  class CumulativeMarginaliaProcessor {
    // =========================
    // Public Methods
    // =========================
    constructor(qaApi, vars, abortFn) {
      this.qa = qaApi;
      this.variables = vars;
      this.abort = abortFn;
      this.rawText = "";
      this.sourceTitle = "";
      this.paragraphs = [];
      this.marginaliaNotes = [];
    }

    async run() {
      const isSuccess = await this.#requestInputs();
      if (!isSuccess) return;

      this.#processTextIntoParagraphs();
      this.#generateCumulativeMarginalia();
      this.#formatAndStoreOutput();

      return this.variables.cumulativeNotes;
    }

    // =========================
    // Private Methods (#)
    // =========================
    async #requestInputs() {
      try {
        const values = await this.qa.requestInputs([
          {
            id: "sourceTitle",
            label: "Source Title / Book Name",
            type: "text",
            placeholder: "e.g., Intro to Economics (Bernanke)",
          },
          {
            id: "rawText",
            label: "Paste Text Block / Multi-Paragraphs",
            type: "textarea",
            placeholder: "Paste paragraphs here...",
          },
        ]);
        this.sourceTitle = values.sourceTitle?.trim() || "Unknown Source";
        this.rawText = values.rawText || "";
        return Boolean(this.rawText);
      } catch {
        this.abort("Input cancelled by user");
        return false;
      }
    }

    #normalizeNewlines(text = "") {
      return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    }

    #cleanText(text = "") {
      return this.#normalizeNewlines(text)
        .replace(/[ \t]+/g, " ")
        .trim();
    }

    #processTextIntoParagraphs() {
      const normalized = this.#normalizeNewlines(this.rawText);
      this.paragraphs = normalized
        .split(/\n{2,}/)
        .map((p) => this.#cleanText(p))
        .filter(Boolean);
    }

    #generateCumulativeMarginalia() {
      this.marginaliaNotes = [];

      this.paragraphs.forEach((paragraph, index) => {
        const paragraphNum = index + 1;

        // Prompt or structure simulated cumulative thinking step:
        // In actual practice, you synthesize previous core ideas + current paragraph idea.
        let summaryEntry = {
          paragraphNumber: paragraphNum,
          originalText: paragraph,
          cumulativeThought: `[Paragraph ${paragraphNum} Summary - Force semantic integration here]`,
        };

        this.marginaliaNotes.push(summaryEntry);
      });
    }

    #formatBlock({
      text = "",
      header = null,
      leadingBlank = false,
      prefix = ">",
    } = {}) {
      if (!text?.trim()) return [];

      const lines = leadingBlank ? [""] : [];
      if (header) {
        lines.push(prefix ? `${prefix} ${header}` : header);
      }

      this.#normalizeNewlines(text)
        .trim()
        .split("\n")
        .forEach((line) => {
          lines.push(prefix ? `${prefix} ${line}` : line);
        });

      return lines;
    }

    #formatAndStoreOutput() {
      const outputLines = [
        `# Cumulative Marginalia: ${this.sourceTitle}`,
        ``,
        `> [!info] Active Reading Procedure`,
        `> *"Force yourself to interact with the semantic content... summarize previous ideas combined with the new paragraph."* — Jeffrey Kaplan`,
        ``,
      ];

      this.marginaliaNotes.forEach((note) => {
        outputLines.push(`### Paragraph ${note.paragraphNumber}`);
        outputLines.push(
          ...this.#formatBlock({
            text: note.originalText,
            header: "Original Text",
            prefix: ">",
          }),
        );
        outputLines.push(``);
        outputLines.push(`**Cumulative Margin Note:**`);
        outputLines.push(
          `- *[Write your cumulative 1-sentence summary connecting paragraphs 1 through ${note.paragraphNumber} here]*`,
        );
        outputLines.push(``);
        outputLines.push(`---`);
        outputLines.push(``);
      });

      this.variables.cumulativeNotes = outputLines.join("\n");
    }
  }

  const processor = new CumulativeMarginaliaProcessor(qa, variables, abort);
  return await processor.run();
};
