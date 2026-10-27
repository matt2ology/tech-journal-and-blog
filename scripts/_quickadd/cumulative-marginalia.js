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
      const isSuccess = await this.#requestInputs();
      if (!isSuccess) return;

      this.#resolveSourceTitle();
      this.#formatAndStoreOutput();

      return this.variables.cumulativeNotes;
    }

    async #requestInputs() {
      try {
        const values = await this.qa.requestInputs([
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
          {
            id: "rawText",
            label: "Paste Text Block to Quote",
            type: "textarea",
            placeholder: "Paste quote here...",
          },
          {
            id: "cumulativeSummary",
            label: "Cumulative Summary (> [!tldr])",
            type: "textarea",
            placeholder: "Enter cumulative summary...",
            optional: true,
          },
          {
            id: "marginaliaNote",
            label: "Marginalia / Reflection",
            type: "textarea",
            placeholder: "Leave blank for default 'I just liked the words'...",
            optional: true,
          },
        ]);

        this.sourceTitle = values.sourceTitle?.trim() || "";
        this.pageOrCitation = values.pageOrCitation?.trim() || "";
        this.cumulativeSummary = values.cumulativeSummary?.trim() || "";
        this.marginaliaNote = values.marginaliaNote?.trim() || "";
        this.rawText = values.rawText || "";

        return Boolean(this.rawText);
      } catch {
        this.abort("Input cancelled by user");
        return false;
      }
    }

    #resolveSourceTitle() {
      if (this.sourceTitle) return;

      const activeFile = app.workspace.getActiveFile();
      if (activeFile) {
        const metadata = app.metadataCache.getFileCache(activeFile);
        const bookProp = metadata?.frontmatter?.book;
        if (bookProp) {
          this.sourceTitle = bookProp;
          return;
        }
      }

      this.sourceTitle = "Unknown Book";
    }

    #parseYouTube(url = "") {
      const safeUrl = url.trim();
      const patterns = [
        /youtu\.be\/([a-zA-Z0-9_-]+).*?[?&]t=(\d+)/,
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+).*?[?&]t=(\d+)/,
      ];

      for (const pattern of patterns) {
        const match = safeUrl.match(pattern);
        if (match) {
          const totalSeconds = parseInt(match[2], 10);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;

          const readable =
            hours > 0
              ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
              : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

          return {
            location: readable,
            url: `https://www.youtube.com/watch?v=${match[1]}&t=${totalSeconds}s`,
          };
        }
      }

      // Check for generic YouTube URL without timestamp
      if (/youtu(be\.com\/watch\?v=|\.be\/)[a-zA-Z0-9_-]+/.test(safeUrl)) {
        return {
          location: "View video",
          url: safeUrl,
        };
      }

      return null;
    }

    #formatAndStoreOutput() {
      let highlight_location = "";
      let highlight_location_url = "";

      const inputVal = this.pageOrCitation;
      if (inputVal) {
        const ytParsed = this.#parseYouTube(inputVal);
        if (ytParsed) {
          highlight_location = ytParsed.location;
          highlight_location_url = ytParsed.url;
        } else if (/^https?:\/\//i.test(inputVal)) {
          highlight_location = "Link";
          highlight_location_url = inputVal;
        } else {
          // Treated as page number or text citation
          highlight_location = /^\d+$/.test(inputVal)
            ? `p. ${inputVal}`
            : inputVal;
        }
      }

      const highlight_note = this.marginaliaNote;
      const highlight_text = this.rawText;

      let marginaliaBlock = "";
      if (highlight_note) {
        marginaliaBlock = `**Marginalia / Reflection:**\n${highlight_note}`;
      } else {
        marginaliaBlock = `**Marginalia / Reflection:**\n_I just liked the words_`;
      }

      const quotedLines = highlight_text
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");

      let locationLine = "";
      if (highlight_location && highlight_location_url) {
        locationLine = `> \\- [${highlight_location}](${highlight_location_url})`;
      } else if (highlight_location) {
        locationLine = `> \\- ${highlight_location}`;
      }

      const outputLines = [
        ``,
        `> [!tldr] Cumulative Summary`,
        `> ${this.cumulativeSummary || "No summary provided."}`,
        ``,
        marginaliaBlock,
        ``,
        `> [!quote]`,
        quotedLines,
        ``,
        `---`,
        ``,
      ];

      if (locationLine) {
        outputLines.push(locationLine);
      }

      this.variables.cumulativeNotes = outputLines.join("\n");
    }
  }

  const processor = new CumulativeMarginaliaProcessor(qa, variables, abort);
  return await processor.run();
};
