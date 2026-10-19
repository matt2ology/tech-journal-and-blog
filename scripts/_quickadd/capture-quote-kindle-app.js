module.exports = async ({ quickAddApi: qa, variables, abort }) => {
  // =========================
  // Helpers: Text & Condition Predicates
  // =========================
  const normalizeNewlines = (text = "") =>
    text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const cleanText = (text = "") =>
    normalizeNewlines(text)
      .replace(/[ \t]+/g, " ")
      .trim();

  const hasManualCitation = (manualCitation) => Boolean(manualCitation?.trim());

  const isKindleCitationText = (text) =>
    /(Kindle Edition\.|\. eBook\.|\. Ebook\.)\s*$/i.test(text);

  const hasMultipleParts = (parts) => parts.length > 1;

  // =========================
  // Helpers: Citation Parsers
  // =========================
  const splitQuoteAndCitation = (raw, manualCitation) => {
    const normalized = normalizeNewlines(raw);
    const parts = normalized
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (hasManualCitation(manualCitation)) {
      return {
        quote: parts.join("\n\n"),
        citation: manualCitation.trim(),
      };
    }

    const lastPart = parts[parts.length - 1];
    if (hasMultipleParts(parts) && isKindleCitationText(lastPart)) {
      return {
        quote: parts.slice(0, -1).join("\n\n"),
        citation: lastPart,
      };
    }

    return {
      quote: parts.join("\n\n"),
      citation: "",
    };
  };

  const hasCommaFormat = (authorPart) => authorPart.includes(",");

  const extractLastName = (authorPart) => {
    if (hasCommaFormat(authorPart)) {
      return authorPart.split(",")[0].trim();
    }
    const firstAuthor = authorPart.split(/;| and /i)[0].trim();
    const nameParts = firstAuthor.split(/\s+/);
    return nameParts[nameParts.length - 1] || "";
  };

  const extractPageNumber = (content) => {
    const pageMatch = content.match(/^(p\.|pp\.|Location)\s*(.+)$/i);
    return pageMatch ? pageMatch[2].trim() : "";
  };

  const extractMLA = (citationRaw = "") => {
    const normalized = normalizeNewlines(citationRaw);
    const authorPart = normalized.match(/^([^.]+)/)?.[1]?.trim() || "";
    const lastName = extractLastName(authorPart);

    let page = "";
    for (const m of normalized.matchAll(/\(([^)]+)\)/g)) {
      const extractedPage = extractPageNumber(m[1]);
      if (extractedPage) {
        page = extractedPage;
        break;
      }
    }

    if (!lastName) return "";
    return page ? `(${lastName} ${page})` : `(${lastName})`;
  };

  const parseYouTube = (url = "") => {
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
  };

  // =========================
  // Helpers: Formatters
  // =========================
  const isBlockEmpty = (text) => !text?.trim();

  const formatBlock = (
    text,
    header = null,
    leadingBlank = false,
    prefix = ">",
  ) => {
    if (isBlockEmpty(text)) return [];

    const lines = leadingBlank ? [""] : [];
    if (header) lines.push(`${prefix} ${header}`);

    normalizeNewlines(text)
      .trim()
      .split("\n")
      .forEach((line) => lines.push(`${prefix} ${line}`));

    return lines;
  };

  const isYouTubeUrlWithoutTimestamp = (citationRaw) =>
    /youtu(be\.com\/watch\?v=|\.be\/)[a-zA-Z0-9_-]+/.test(citationRaw);

  const formatVideoCitation = (citationRaw) => {
    const ytWithTime = parseYouTube(citationRaw);
    if (ytWithTime) {
      const text = `View at ${ytWithTime.readable} (${ytWithTime.totalSeconds}s)`;
      return {
        line: `>\\- [${text}](${ytWithTime.url})`,
        label: text,
        hasTimestamp: true,
      };
    }

    if (isYouTubeUrlWithoutTimestamp(citationRaw)) {
      return {
        line: `>\\- [View source](${citationRaw.trim()})`,
        label: null,
        hasTimestamp: false,
      };
    }

    return { line: null, label: null, hasTimestamp: false };
  };

  const resolveCitationLine = (video, cleanCitation, mlaCitation) => {
    if (video.line) {
      return video.line;
    }
    if (cleanCitation && mlaCitation) {
      return `> \\- ${cleanCitation} ${mlaCitation}`;
    }
    if (cleanCitation) {
      return `> \\- ${cleanCitation}`;
    }
    return "> \\- Unknown Source (Please provide manual MLA citation: Author, Title (p. #) or URL)";
  };

  const formatCitation = (citationRaw, mlaCitation, hasQuote = true) => {
    if (!hasQuote) return [];

    const video = formatVideoCitation(citationRaw);
    const cleanCitation = (citationRaw || "")
      .replace(/- Unknown Source.*$/i, "")
      .trim();
    const line = resolveCitationLine(video, cleanCitation, mlaCitation);

    const result = [line];
    result.videoLabel = video.hasTimestamp ? video.label : null;
    return result;
  };

  // =========================
  // Execution Flow
  // =========================
  let values;
  try {
    values = await qa.requestInputs([
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
  } catch {
    return abort("Input cancelled by user");
  }

  const { quote, citation } = splitQuoteAndCitation(
    values.quote || "",
    values.manualCitation,
  );
  const quoteText = cleanText(quote);
  const mlaCitation = extractMLA(citation);

  const citationOutput = formatCitation(citation, mlaCitation, !!quoteText);
  const reflectionOutput = formatBlock(
    values.reflection,
    "**Marginalia / Reflection:**",
    true,
    "",
  );
  const quoteOutput = formatBlock(quoteText, "[!cite]");

  const output = [...reflectionOutput, "", ...quoteOutput, ...citationOutput];

  const formatted = output.join("\n");
  variables.formattedQuote = formatted;
  return formatted;
};
