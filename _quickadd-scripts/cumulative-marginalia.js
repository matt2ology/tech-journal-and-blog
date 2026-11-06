module.exports = async ({ quickAddApi: qa, variables, abort }) => {
  class CumulativeMarginaliaProcessor {
    constructor(qaApi, vars, abortFn) {
      this.qa = qaApi;
      this.variables = vars;
      this.abort = abortFn;
      this.sourceTitle = "";
      this.pageOrCitation = "";
      this.cumulativeSummary = "";
      this.marginaliaNote = "";
      this.rawText = "";
    }

    async run() {
      try {
        const inputSuccessStatus = await this.#requestInputs();
        this.#checkInputSuccess(inputSuccessStatus);

        this.#resolveSourceTitle();
        this.#formatAndStoreOutput();

        return this.variables.cumulativeNotes;
      } finally {
        this.#closeSummaryWindow();
      }
    }

    #closeSummaryWindow() {
      if (app.cumulativeSummaryWindowLeaf) {
        try {
          app.cumulativeSummaryWindowLeaf.detach();
        } catch {}
        app.cumulativeSummaryWindowLeaf = null;
      }
    }

    // --- Private Methods: Workflow & Formatting (Verbs) ---

    async #requestInputs() {
      try {
        const inputValues = await this.qa.requestInputs([
          {
            id: "rawText",
            label: "Paste Text Block to Quote",
            type: "textarea",
            placeholder: "Paste quote here...",
          },
          {
            id: "cumulativeSummary",
            label: "Cumulative Summary",
            type: "textarea",
            placeholder: "Enter cumulative summary (optional)...",
            optional: true,
          },
          {
            id: "marginaliaNote",
            label: "Marginalia / Reflection",
            type: "textarea",
            placeholder: "Leave blank for default 'I just liked the words'...",
            optional: true,
          },
          {
            id: "sourceTitle",
            label:
              "Source Title / Book Name (Leave blank to use YAML 'book' property)",
            type: "text",
            placeholder: "e.g., Intro to Economics (Bernanke)",
            optional: true,
          },
          {
            id: "pageOrCitation",
            label: "Page Number, YouTube URL (with timestamp), or Web URL",
            type: "text",
            placeholder:
              "e.g., 42, https://youtu.be/...&t=120s, or https://example.com",
            optional: true,
          },
        ]);

        this.sourceTitle = inputValues.sourceTitle?.trim() || "";
        this.pageOrCitation = inputValues.pageOrCitation?.trim() || "";
        this.cumulativeSummary = inputValues.cumulativeSummary?.trim() || "";
        this.marginaliaNote = inputValues.marginaliaNote?.trim() || "";
        this.rawText = inputValues.rawText || "";

        return Boolean(this.rawText);
      } catch {
        this.abort("Input cancelled by user");
        return false;
      }
    }

    #resolveSourceTitle() {
      if (this.#evaluateExistingSourceTitle()) return;

      const activeMarkdownFile = app.workspace.getActiveFile();
      if (this.#evaluateActiveFileExists(activeMarkdownFile)) {
        const fileMetadata = app.metadataCache.getFileCache(activeMarkdownFile);
        const bookProperty = fileMetadata?.frontmatter?.book;
        if (this.#evaluateBookPropertyExists(bookProperty)) {
          this.sourceTitle = bookProperty;
          return;
        }
      }

      this.sourceTitle = "Unknown Book";
    }

    #parseYouTube(url = "") {
      const sanitizedUrl = url.trim();
      const youtubePatterns = [
        /youtu\.be\/([a-zA-Z0-9_-]+).*?[?&]t=(\d+)/,
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+).*?[?&]t=(\d+)/,
      ];

      for (const pattern of youtubePatterns) {
        const regexMatch = sanitizedUrl.match(pattern);
        if (this.#evaluateRegexMatchExists(regexMatch)) {
          const totalTimeSeconds = parseInt(regexMatch[2], 10);
          const timeHours = Math.floor(totalTimeSeconds / 3600);
          const timeMinutes = Math.floor((totalTimeSeconds % 3600) / 60);
          const timeSeconds = totalTimeSeconds % 60;

          const formattedTimestamp = this.#evaluateHoursExist(timeHours)
            ? `${String(timeHours).padStart(2, "0")}:${String(timeMinutes).padStart(2, "0")}:${String(timeSeconds).padStart(2, "0")}`
            : `${String(timeMinutes).padStart(2, "0")}:${String(timeSeconds).padStart(2, "0")}`;

          return {
            location: formattedTimestamp,
            url: `https://www.youtube.com/watch?v=${regexMatch[1]}&t=${totalTimeSeconds}s`,
          };
        }
      }

      if (this.#evaluateGenericYouTubePattern(sanitizedUrl)) {
        return {
          location: "View video",
          url: sanitizedUrl,
        };
      }

      return null;
    }

    #formatAndStoreOutput() {
      let highlightLocation = "";
      let highlightLocationUrl = "";

      const pageOrCitationInput = this.pageOrCitation;
      if (this.#evaluatePageOrCitationInputExists(pageOrCitationInput)) {
        const parsedYouTubeData = this.#parseYouTube(pageOrCitationInput);
        if (this.#evaluateParsedYouTubeDataExists(parsedYouTubeData)) {
          highlightLocation = parsedYouTubeData.location;
          highlightLocationUrl = parsedYouTubeData.url;
        } else if (this.#evaluateWebUrlPattern(pageOrCitationInput)) {
          highlightLocation = "Link";
          highlightLocationUrl = pageOrCitationInput;
        } else {
          highlightLocation = this.#evaluateNumericPagePattern(
            pageOrCitationInput,
          )
            ? `p. ${pageOrCitationInput}`
            : pageOrCitationInput;
        }
      }

      const highlightNoteText = this.marginaliaNote;
      const highlightRawText = this.rawText;

      let marginaliaContentBlock = "";
      if (this.#evaluateHighlightNoteExists(highlightNoteText)) {
        const noteTextLines = highlightNoteText
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n");

        marginaliaContentBlock = [
          `> [!note] Marginalia / Reflection`,
          noteTextLines,
        ].join("\n");
      } else if (this.#evaluateCumulativeSummaryEmpty()) {
        marginaliaContentBlock = [
          `> [!note] Marginalia / Reflection`,
          `> _I just liked the words_`,
        ].join("\n");
      }

      const quotedTextLines = highlightRawText
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");

      let locationMarkdownLine = "";
      if (
        this.#evaluateLocationAndUrlExist(
          highlightLocation,
          highlightLocationUrl,
        )
      ) {
        locationMarkdownLine = `> \\- [${highlightLocation}](${highlightLocationUrl})`;
      } else if (this.#evaluateLocationOnlyExists(highlightLocation)) {
        locationMarkdownLine = `> \\- ${highlightLocation}`;
      }

      // Collect blockquote/callout sections to safely insert HTML comments between them (MD028 fix)
      const blockquoteSections = [];

      if (this.#evaluateCumulativeSummaryExists()) {
        const summaryTextLines = this.cumulativeSummary
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n");

        blockquoteSections.push(
          `> [!summary] Cumulative Summary\n${summaryTextLines}`,
        );
      }

      let quoteAndLocationBlock = `> [!quote]\n${quotedTextLines}`;
      if (this.#evaluateLocationLineExists(locationMarkdownLine)) {
        quoteAndLocationBlock += `\n${locationMarkdownLine}`;
      }
      blockquoteSections.push(quoteAndLocationBlock);

      if (this.#evaluateMarginaliaBlockExists(marginaliaContentBlock)) {
        blockquoteSections.push(marginaliaContentBlock);
      }

      // Join sections with a blank line containing an HTML comment to satisfy [MD028](https://github.com/DavidAnson/markdownlint/blob/v0.41.1/doc/md028.md)
      const combinedBlockquoteContent = blockquoteSections.join(
        "\n\n<!-- blockquote separator -->\n\n",
      );

      const outputMarkdownLines = [
        ``,
        combinedBlockquoteContent,
        ``,
        `---`,
        ``,
      ];

      this.variables.cumulativeNotes = outputMarkdownLines.join("\n");
    }

    // --- Private Methods: Condition Checkers (Verbs) ---

    #checkInputSuccess(inputSuccessStatus) {
      if (!inputSuccessStatus) return;
    }

    #evaluateExistingSourceTitle() {
      return Boolean(this.sourceTitle);
    }

    #evaluateActiveFileExists(activeMarkdownFile) {
      return Boolean(activeMarkdownFile);
    }

    #evaluateBookPropertyExists(bookProperty) {
      return Boolean(bookProperty);
    }

    #evaluateRegexMatchExists(regexMatch) {
      return Boolean(regexMatch);
    }

    #evaluateHoursExist(timeHours) {
      return timeHours > 0;
    }

    #evaluateGenericYouTubePattern(sanitizedUrl) {
      return /youtu(be\.com\/watch\?v=|\.be\/)[a-zA-Z0-9_-]+/.test(
        sanitizedUrl,
      );
    }

    #evaluatePageOrCitationInputExists(pageOrCitationInput) {
      return Boolean(pageOrCitationInput);
    }

    #evaluateParsedYouTubeDataExists(parsedYouTubeData) {
      return Boolean(parsedYouTubeData);
    }

    #evaluateWebUrlPattern(pageOrCitationInput) {
      return /^https?:\/\//i.test(pageOrCitationInput);
    }

    #evaluateNumericPagePattern(pageOrCitationInput) {
      return /^\d+$/.test(pageOrCitationInput);
    }

    #evaluateHighlightNoteExists(highlightNoteText) {
      return Boolean(highlightNoteText);
    }

    #evaluateCumulativeSummaryEmpty() {
      return !this.cumulativeSummary;
    }

    #evaluateLocationAndUrlExist(highlightLocation, highlightLocationUrl) {
      return Boolean(highlightLocation && highlightLocationUrl);
    }

    #evaluateLocationOnlyExists(highlightLocation) {
      return Boolean(highlightLocation);
    }

    #evaluateCumulativeSummaryExists() {
      return Boolean(this.cumulativeSummary);
    }

    #evaluateMarginaliaBlockExists(marginaliaContentBlock) {
      return Boolean(marginaliaContentBlock);
    }

    #evaluateLocationLineExists(locationMarkdownLine) {
      return Boolean(locationMarkdownLine);
    }
  }

  const processorInstance = new CumulativeMarginaliaProcessor(
    qa,
    variables,
    abort,
  );
  return await processorInstance.run();
};
