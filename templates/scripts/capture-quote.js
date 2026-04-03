module.exports = async ({ quickAddApi: qa, variables, abort }) => {
  // =========================
  // Prompt user for input
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

  const raw = values.quote || "";

  // =========================
  // Split quote + citation
  // =========================
  const parts = raw.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

  let quoteText = "";
  let citationRaw = "";

  if (parts.length === 1) {
    quoteText = parts[0];
    citationRaw =
      values.manualCitation?.trim() ||
      "\\- Unknown Source (Please provide manual MLA citation: Author, Title (p. #))";
  } else {
    quoteText = parts.slice(0, -1).join("\n\n");
    citationRaw = parts[parts.length - 1];
  }

  // Clean quote spacing
  quoteText = quoteText.replace(/\s+/g, " ").trim();

  // =========================
  // Extract MLA in-text citation
  // =========================
  let mlaCitation = "";

  if (citationRaw) {
    const lastNameMatch = citationRaw.match(/^([^,\.]+)/);
    const pageMatch = citationRaw.match(/\((p\.|Location)\s*([^)]+)\)/i);

    const lastName = lastNameMatch ? lastNameMatch[1].trim() : "";
    const page = pageMatch ? pageMatch[2].trim() : "";

    if (lastName && page) {
      mlaCitation = `(${lastName} ${page})`;
    } else if (lastName) {
      mlaCitation = `(${lastName})`;
    }
  }

  // =========================
  // Format output
  // =========================
  const lines = [];

  lines.push("> [!cite]");

  quoteText.split("\n").forEach(line => {
    lines.push(`> ${line}`);
  });

  // =========================
  // Citation formatting (with strict YouTube handling)
  // =========================
  if (citationRaw) {
    const ytStrictMatch = citationRaw.match(
      /^https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)\?[^ ]*?[?&]t=([0-9]+)$/
    );

    if (ytStrictMatch) {
      const videoId = ytStrictMatch[1];
      const totalSeconds = parseInt(ytStrictMatch[2], 10);

      // Convert to h:mm:ss or m:ss
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      let readable;
      if (hours > 0) {
        readable = `${hours}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      } else {
        readable = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      }

      const cleanUrl = `https://www.youtube.com/watch?v=${videoId}&t=${totalSeconds}s`;

      lines.push(
        `> \\- [View at ${readable} (${totalSeconds}s)](${cleanUrl})`
      );
    } else {
      lines.push(
        `> \\- ${citationRaw}${mlaCitation ? " " + mlaCitation : ""}`
      );
    }
  }

  // =========================
  // Reflection (optional)
  // =========================
  if (values.reflection && values.reflection.trim()) {
    lines.push("");
    lines.push("> [!note] Marginalia / Reflection");
    lines.push("> " + values.reflection.trim());
  }

  const formatted = lines.join("\n");

  // =========================
  // Return variable
  // =========================
  variables.formattedQuote = formatted;

  return formatted;
};