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
        id: "citation",
        label: "In-Text Citation (optional override)",
        type: "text",
        placeholder: "Optional manual citation",
      },
    ]);
  } catch {
    return abort("Input cancelled by user");
  }

  const raw = values.quote || "";

  // =========================
  // Parse Kindle format
  // =========================
  // Kindle format is usually:
  // [quote text]
  //
  //
  // [citation line]

  const parts = raw.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

  let quoteText = "";
  let citationText = "";

  if (parts.length === 1) {
    // fallback: no citation detected
    quoteText = parts[0];
  } else {
    quoteText = parts.slice(0, -1).join("\n\n");
    citationText = parts[parts.length - 1];
  }

  // Normalize whitespace inside quote
  quoteText = quoteText.replace(/\s+/g, " ").trim();

  // Use manual citation override if provided
  if (values.citation && values.citation.trim()) {
    citationText = values.citation.trim();
  }

  // =========================
  // Format output
  // =========================
  const formatted = [
    "> [!cite]",
    ...quoteText.split("\n").map(line => `> ${line}`),
    citationText ? `> \\- ${citationText}` : ""
  ].join("\n");

  // =========================
  // Return variables
  // =========================
  variables.formattedQuote = formatted;

  return formatted;
};