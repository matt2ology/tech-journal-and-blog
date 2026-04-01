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
        label: "Manual Citation (only if none detected)",
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
    citationRaw = values.manualCitation?.trim() || "";
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

  if (citationRaw) {
    lines.push(
      `> \\- ${citationRaw}${mlaCitation ? " " + mlaCitation : ""}`
    );
  }

  // Only include reflection if provided
  if (values.reflection && values.reflection.trim()) {
    lines.push("");
    lines.push("**Marginalia / Reflection:**");
    lines.push(values.reflection.trim());
  }

  const formatted = lines.join("\n");

  // =========================
  // Return variable
  // =========================
  variables.formattedQuote = formatted;

  return formatted;
};