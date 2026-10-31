module.exports = async ({ quickAddApi: qa, variables, abort }) => {
  class QuoteProcessor {
    // =========================
    // Public Methods
    // =========================
    constructor(qaApi, vars, abortFn) {
      this.qa = qaApi;
      this.variables = vars;
      this.abort = abortFn;
      this.rawQuote = "";
      this.manualCitation = "";
      this.reflection = "";
      this.quote = "";
      this.citation = "";
      this.mlaCitation = "";
    }

    async run() {
      const isSuccess = await this.#requestInputs();
      if (!isSuccess) return;

      this.#processQuoteAndCitation();
      this.#formatAndStoreOutput();
      return this.variables.formattedQuote;
    }

    // =========================
    // Private Methods (#)
    // =========================
    async #requestInputs() {
      try {
        const values = await this.qa.requestInputs([
          { id: "quote", label: "Quote", type: "textarea" },
          {
            id: "manualCitation",
            label: "Manual Citation (or YouTube URL with timestamp)",
            type: "text",
            placeholder: "Optional: Author, Title (p. #) or URL",
            optional: true,
          },
          {
            id: "reflection",
            label: "Marginalia / Reflection (optional)",
            type: "textarea",
          },
        ]);
        this.rawQuote = values.quote || "";
        this.manualCitation = values.manualCitation || "";
        this.reflection = values.reflection || "";
        return true;
      } catch {
        this.abort("Input cancelled by user");
        return false;
      }
    }

    #normalizeText(text = "") {
      return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    }

    #cleanText(text = "") {
      return this.#normalizeText(text)
        .replace(/[ \t]+/g, " ")
        .trim();
    }

    #hasManualCitation() {
      return Boolean(this.manualCitation?.trim());
    }

    #isKindleCitationText(text = "") {
      return /(Kindle Edition\.|\. eBook\.|\. Ebook\.)\s*$/i.test(text);
    }

    #hasMultipleParts(parts = []) {
      return parts.length > 1;
    }

    #splitQuoteAndCitation() {
      const normalized = this.#normalizeText(this.rawQuote);
      const parts = normalized
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);

      if (this.#hasManualCitation()) {
        this.quote = this.#cleanText(parts.join("\n\n"));
        this.citation = this.manualCitation.trim();
        return;
      }

      const lastPart = parts[parts.length - 1];
      if (
        this.#hasMultipleParts(parts) &&
        this.#isKindleCitationText(lastPart)
      ) {
        this.quote = this.#cleanText(parts.slice(0, -1).join("\n\n"));
        this.citation = lastPart;
        return;
      }

      this.quote = this.#cleanText(parts.join("\n\n"));
      this.citation = "";
    }

    #hasCommaFormat(authorPart = "") {
      return authorPart.includes(",");
    }

    #extractLastName(authorPart = "") {
      if (this.#hasCommaFormat(authorPart)) {
        return authorPart.split(",")[0].trim();
      }
      const firstAuthor = authorPart.split(/;| and /i)[0].trim();
      const nameParts = firstAuthor.split(/\s+/);
      return nameParts[nameParts.length - 1] || "";
    }

    #extractPageNumber(content = "") {
      const pageMatch = content.match(/^(p\.|pp\.|Location)\s*(.+)$/i);
      return pageMatch ? pageMatch[2].trim() : "";
    }

    #extractMLA() {
      const normalized = this.#normalizeText(this.citation);
      const authorPart = normalized.match(/^([^.]+)/)?.[1]?.trim() || "";
      const lastName = this.#extractLastName(authorPart);

      let page = "";
      for (const m of normalized.matchAll(/\(([^)]+)\)/g)) {
        const extractedPage = this.#extractPageNumber(m[1]);
        if (extractedPage) {
          page = extractedPage;
          break;
        }
      }

      if (!lastName) return "";
      return page ? `(${lastName} ${page})` : `(${lastName})`;
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
              ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
              : `${minutes}:${String(seconds).padStart(2, "0")}`;

          return {
            videoId: match[1],
            totalSeconds,
            readable,
            url: `https://www.youtube.com/watch?v=${match[1]}&t=${totalSeconds}s`,
          };
        }
      }

      return null;
    }

    #isBlockEmpty(text = "") {
      return !text?.trim();
    }

    #formatBlock({
      text = "",
      header = null,
      leadingBlank = false,
      prefix = ">",
    } = {}) {
      if (this.#isBlockEmpty(text)) return [];

      const lines = leadingBlank ? [""] : [];
      if (header) {
        lines.push(prefix ? `${prefix} ${header}` : header);
      }

      this.#normalizeText(text)
        .trim()
        .split("\n")
        .forEach((line) => {
          lines.push(prefix ? `${prefix} ${line}` : line);
        });

      return lines;
    }

    #isYouTubeUrlWithoutTimestamp(citationRaw = "") {
      return /youtu(be\.com\/watch\?v=|\.be\/)[a-zA-Z0-9_-]+/.test(citationRaw);
    }

    #formatVideoCitation() {
      const ytWithTime = this.#parseYouTube(this.citation);
      if (ytWithTime) {
        const text = `View at ${ytWithTime.readable} (${ytWithTime.totalSeconds}s)`;
        return {
          line: `>\\- [${text}](${ytWithTime.url})`,
          label: text,
          hasTimestamp: true,
        };
      }

      if (this.#isYouTubeUrlWithoutTimestamp(this.citation)) {
        return {
          line: `>\\- [View source](${this.citation.trim()})`,
          label: null,
          hasTimestamp: false,
        };
      }

      return { line: null, label: null, hasTimestamp: false };
    }

    #resolveCitationLine(video) {
      if (video.line) {
        return video.line;
      }
      const cleanCitation = (this.citation || "")
        .replace(/- Unknown Source.*$/i, "")
        .trim();

      if (cleanCitation && this.mlaCitation) {
        return `> \\- ${cleanCitation} ${this.mlaCitation}`;
      }
      if (cleanCitation) {
        return `> \\- ${cleanCitation}`;
      }
      return "> \\- Unknown Source (Please provide manual MLA citation: Author, Title (p. #) or URL)";
    }

    #formatCitation() {
      if (!this.quote) return [];

      const video = this.#formatVideoCitation();
      const line = this.#resolveCitationLine(video);

      const result = [line];
      result.videoLabel = video.hasTimestamp ? video.label : null;
      return result;
    }

    #processQuoteAndCitation() {
      this.#splitQuoteAndCitation();
      this.mlaCitation = this.#extractMLA();
    }

    #formatAndStoreOutput() {
      const citationOutput = this.#formatCitation();
      const reflectionOutput = this.#formatBlock({
        text: this.reflection,
        header: "**Marginalia / Reflection:**",
        leadingBlank: true,
        prefix: "",
      });
      const quoteOutput = this.#formatBlock({
        text: this.quote,
        header: "[!cite]",
      });

      const output = [
        ...reflectionOutput,
        "",
        ...quoteOutput,
        ...citationOutput,
      ];
      this.variables.formattedQuote = output.join("\n");
    }
  }

  const processor = new QuoteProcessor(qa, variables, abort);
  return await processor.run();
};
