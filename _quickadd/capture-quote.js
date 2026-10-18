module.exports = async ({ quickAddApi: qa, variables, abort }) => {
  // =========================
  // Helpers
  // =========================

  const normalizeNewlines = (text = "") =>
    text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const cleanText = (text = "") =>
    normalizeNewlines(text).replace(/[ \t]+/g, " ").trim();

  const splitQuoteAndCitation = (raw, manualCitation) => {
    const normalized = normalizeNewlines(raw);

    const parts = normalized
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    // Manual citation always wins
    if (manualCitation?.trim()) {
      return {
        quote: parts.join("\n\n"),
        citation: manualCitation.trim(),
      };
    }

    if (parts.length > 1) {
      const last = parts[parts.length - 1];

      // ✅ Strict Kindle detection
      const isKindleCitation =
        /(Kindle Edition\.|\. eBook\.|\. Ebook\.)\s*$/i.test(last);

      if (isKindleCitation) {
        return {
          quote: parts.slice(0, -1).join("\n\n"),
          citation: last,
        };
      }
    }

    // Fallback: no split
    return {
      quote: parts.join("\n\n"),
      citation: "",
    };
  };

  const extractMLA = (citationRaw = "") => {
    const normalized = normalizeNewlines(citationRaw);

    const authorPart = normalized.match(/^([^.]+)/)?.[1]?.trim() || "";

    let lastName = "";

    if (authorPart.includes(",")) {
      // Format: Last, First
      lastName = authorPart.split(",")[0].trim();
    } else {
      // Format: First Middle Last OR multiple authors with ; or "and"
      const firstAuthor = authorPart.split(/;| and /i)[0].trim();
      const nameParts = firstAuthor.split(/\s+/);
      lastName = nameParts[nameParts.length - 1] || "";
    }

    const matches = [...normalized.matchAll(/\(([^)]+)\)/g)];

    let page = "";

    for (const m of matches) {
      const content = m[1];
      const pageMatch = content.match(/^(p\.|pp\.|Location)\s*(.+)$/i);
      if (pageMatch) {
        page = pageMatch[2].trim();
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
        return buildResult(match[1], parseInt(match[2], 10));
      }
    }

    return null;
  };

  const buildResult = (videoId, totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const readable =
      hours > 0
        ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        : `${minutes}:${String(seconds).padStart(2, "0")}`;

    return {
      videoId,
      totalSeconds,
      readable,
      url: `https://www.youtube.com/watch?v=${videoId}&t=${totalSeconds}s`,
    };
  };

  const formatBlock = (
    text,
    header = null,
    leadingBlank = false,
    prefix = ">"
  ) => {
    if (!text?.trim()) return [];

    const normalized = normalizeNewlines(text);

    const lines = [];
    if (leadingBlank) lines.push("");
    if (header) lines.push(`${prefix} ${header}`);

    lines.push(
      ...normalized
        .trim()
        .split("\n")
        .map((line) => `${prefix} ${line}`)
    );

    return lines;
  };

  const formatQuoteBlock = (text) => formatBlock(text, "[!cite]");

  const formatReflection = (text, videoLabel = null) => {
    const header = "**Marginalia / Reflection:**";
    return formatBlock(text, header, true, "");
  };

  const formatVideoCitation = (citationRaw) => {
    // YouTube with timestamp
    const ytWithTime = parseYouTube(citationRaw);

    if (ytWithTime) {
      const text = `View at ${ytWithTime.readable} (${ytWithTime.totalSeconds}s)`;
      return {
        line: `>\\- [${text}](${ytWithTime.url})`,
        label: text,
        hasTimestamp: true,
      };
    }

    // YouTube without timestamp
    const ytNoTimeMatch = citationRaw.match(
      /youtu(be\.com\/watch\?v=|\.be\/)[a-zA-Z0-9_-]+/
    );

    if (ytNoTimeMatch) {
      return {
        line: `>\\- [View source](${citationRaw.trim()})`,
        label: null,
        hasTimestamp: false,
      };
    }

    return { line: null, label: null, hasTimestamp: false };
  };

  const formatCitation = (citationRaw, mlaCitation, hasQuote = true) => {
    // Only output unknown source if there's a quote but no citation
    if (!hasQuote) return [];

    const video = formatVideoCitation(citationRaw);

    let cleanCitation = (citationRaw || "")
      .replace(/- Unknown Source.*$/i, "")
      .trim();

    let line;

    if (video.line) {
      line = video.line;
    } else if (cleanCitation && mlaCitation) {
      line = `> \\- ${cleanCitation} ${mlaCitation}`;
    } else if (cleanCitation) {
      line = `> \\- ${cleanCitation}`;
    } else {
      line =
        "> \\- Unknown Source (Please provide manual MLA citation: Author, Title (p. #) or URL)";
    }

    const result = line ? [line] : [];
    result.videoLabel = video.hasTimestamp ? video.label : null;

    return result;
  };

  // =========================
  // Prompt user
  // =========================
  let values;
  try {
    values = await qa.requestInputs([
      { id: "quote", label: "Quote", type: "textarea" },
      { id: "manualCitation", label: "Manual Citation (or YouTube URL with timestamp)", type: "text" },
      { id: "reflection", label: "Marginalia / Reflection (optional)", type: "textarea" },
    ]);
  } catch {
    return abort("Input cancelled by user");
  }

  // =========================
  // Process data
  // =========================
  const raw = values.quote || "";

  const { quote, citation } = splitQuoteAndCitation(
    raw,
    values.manualCitation
  );

  const quoteText = cleanText(quote);
  const mlaCitation = extractMLA(citation);

  // =========================
  // Build output
  // =========================
  const citationOutput = formatCitation(
    citation,
    mlaCitation,
    !!quoteText
  );

  const reflectionLabel = citationOutput.videoLabel || null;

  const output = [
    ...formatReflection(values.reflection, reflectionLabel),
    "",
    ...formatQuoteBlock(quoteText),
    ...citationOutput,
  ];

  const formatted = output.join("\n");

  // =========================
  // Return
  // =========================
  variables.formattedQuote = formatted;
  return formatted;
};
