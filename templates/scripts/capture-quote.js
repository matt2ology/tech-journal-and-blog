module.exports = async ({ quickAddApi: qa, variables, abort }) => {
  // =========================
  // Helpers
  // =========================
  const cleanText = (text = "") => text.replace(/\s+/g, " ").trim();

  const splitQuoteAndCitation = (raw, manualCitation) => {
    const parts = raw
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    const quote = parts.slice(0, -1).join("\n\n") || parts[0] || "";
    const citation =
      parts.length > 1
        ? parts.at(-1)
        : manualCitation?.trim() ||
          "\\- Unknown Source (Please provide manual MLA citation: Author, Title (p. #))";

    return { quote, citation };
  };

  const extractMLA = (citationRaw = "") => {
    const lastNameMatch = citationRaw.match(/^([^,\.]+)/);
    const pageMatch = citationRaw.match(/\((p\.|Location)\s*([^)]+)\)/i);

    const lastName = lastNameMatch?.[1]?.trim();
    const page = pageMatch?.[2]?.trim();

    const mla =
      lastName && page
        ? `(${lastName} ${page})`
        : lastName
          ? `(${lastName})`
          : "";

    return mla;
  };

  /**
   * Parse YouTube timestamps from shortened and full URLs
   * @param {string} citationRaw
   * @returns {object|null} { videoId, totalSeconds, readable, url } or null
   */
  const parseYouTube = (citationRaw = "") => {
    let result = null;

    // Match shortened youtu.be URL with ?t=
    const shortMatch = citationRaw.match(
      /^https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)\?[^ ]*?[?&]t=([0-9]+)$/,
    );

    // Match full youtube.com/watch URL with &t= or ?t=
    const fullMatch = citationRaw.match(
      /^https:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)&?(?:.*?&)?t=([0-9]+)/,
    );

    if (shortMatch) {
      const [, videoId, secondsStr] = shortMatch;
      const totalSeconds = parseInt(secondsStr, 10);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const readable =
        hours > 0
          ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
          : `${minutes}:${seconds.toString().padStart(2, "0")}`;

      result = {
        videoId,
        totalSeconds,
        readable,
        url: `https://www.youtube.com/watch?v=${videoId}&t=${totalSeconds}s`,
      };
    } else if (fullMatch) {
      const [, , videoId, secondsStr] = fullMatch;
      const totalSeconds = parseInt(secondsStr, 10);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const readable =
        hours > 0
          ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
          : `${minutes}:${seconds.toString().padStart(2, "0")}`;

      result = {
        videoId,
        totalSeconds,
        readable,
        url: `https://www.youtube.com/watch?v=${videoId}&t=${totalSeconds}s`,
      };
    }

    return result;
  };

  /**
   * Create a block of lines with optional header and optional leading blank line.
   * @param {string} text - Main text content
   * @param {string|null} header - Optional block header like [!cite] or [!note]
   * @param {boolean} addLeadingBlankLine - Insert a blank line before this block
   * @param {string} prefix - Optional prefix for each line, default ">"
   * @returns {string[]} - Array of formatted lines
   */
  const formatBlock = (text, header = null, addLeadingBlankLine = false, prefix = ">") => {
    const lines = [];
    const trimmedText = text?.trim() || "";
    const contentLines = trimmedText.split("\n").map(line => `${prefix} ${line}`);

    if (trimmedText) {
      if (addLeadingBlankLine) lines.push("");
      if (header) lines.push(`${prefix} ${header}`);
      lines.push(...contentLines);
    }

    return lines;
  };

  // First block (quote) - no leading blank line
  const formatQuoteBlock = (quoteText) =>
    formatBlock(quoteText, "[!cite]", false);

  
  // Returns the Markdown line for video citation and a label for reflection
  const formatVideoCitation = (citationRaw) => {
    let result = { line: null, label: null };
    const yt = parseYouTube(citationRaw);
    if (yt) {
      const text = `View at ${yt.readable} (${yt.totalSeconds}s)`;
      result.line = `> \\- [${text}](${yt.url})`;
      result.label = text;
    }
    return result;
  };

  const formatCitation = (citationRaw, mlaCitation) => {
    let result = [];
    if (citationRaw) {
      const video = formatVideoCitation(citationRaw);
      const line = video.line || `> \\- ${citationRaw}${mlaCitation ? " " + mlaCitation : ""}`;
      result = [line];
      result.videoLabel = video.label; // save for reflection
    }
    return result;
  };

  // Reflection - add blank line before block, and include video timestamp if available
  const formatReflection = (reflection, videoLabel = null) => {
    const header = videoLabel
      ? `[!note] Marginalia / Reflection at ${videoLabel}`
      : "[!note] Marginalia / Reflection";
    return formatBlock(reflection, header, true);
  };

  // =========================
  // Prompt user
  // =========================
  let values;
  try {
    values = await qa.requestInputs([
      {
        id: "quote",
        label: "Quote",
        type: "textarea",
        placeholder: "Paste Kindle quote here...",
      },
      {
        id: "manualCitation",
        label: "Manual Citation (or YouTube URL with timestamp)",
        type: "text",
        placeholder: "Author, Title (p. #)...",
      },
      {
        id: "reflection",
        label: "Marginalia / Reflection (optional)",
        type: "textarea",
        placeholder: "Your thoughts, interpretation, connections...",
      },
    ]);
  } catch {
    return abort("Input cancelled by user");
  }

  // =========================
  // Process data
  // =========================
  const raw = values.quote || "";
  const { quote, citation } = splitQuoteAndCitation(raw, values.manualCitation);
  const quoteText = cleanText(quote);
  const mlaCitation = extractMLA(citation);

  // =========================
  // Build output
  // =========================
  const citationOutput = formatCitation(citation, mlaCitation);
  const output = [
    ...formatQuoteBlock(quoteText),
    ...citationOutput,
    ...formatReflection(values.reflection, citationOutput.videoLabel),
  ];

  const formatted = output.join("\n");

  // =========================
  // Return
  // =========================
  variables.formattedQuote = formatted;
  return formatted;
};
