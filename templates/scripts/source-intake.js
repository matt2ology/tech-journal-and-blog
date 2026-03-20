module.exports = async (params) => {
  const { quickAddApi: qa, variables, abort } = params;

  // =========================
  // Prompt user for input
  // =========================
  let values;
  try {
    values = await qa.requestInputs([
      {
        id: "title",
        label: "Title",
        type: "text",
        placeholder: "Human Resources Training Documentation",
      },
      {
        id: "authors",
        label: "Authors (separate with ;)",
        type: "text",
        placeholder: "Doe, John; Smith, Jane",
      },
      {
        id: "media",
        label: "Media Type",
        type: "suggester",
        options: ["articles", "books", "podcasts", "youtube"],
        placeholder: "Select or type media type...",
        suggesterConfig: { caseSensitive: false },
      },
      {
        id: "source",
        label: "Source Link",
        type: "text",
        placeholder: "https://...",
      },
    ]);
  } catch (e) {
    return abort("Input cancelled by user");
  }

  // =========================
  // Extract and clean input
  // =========================
  const authorsRaw = values.authors?.trim();
  const titleRaw = values.title?.trim();
  const mediaRaw = values.media?.trim();
  const sourceLink = values.source?.trim();

  if (!authorsRaw) return abort("Missing authors");
  if (!titleRaw) return abort("Missing title");

  const originalAuthors = authorsRaw;
  const originalTitle = titleRaw;
  const mediaType = mediaRaw || "unknown";

  // =========================
  // Author Processing
  // =========================
  const MAX_AUTHORS_IN_SLUG = 2;

  const authorList = authorsRaw
    .split(";")
    .map((a) => a.trim())
    .filter(Boolean);

  if (authorList.length === 0) return abort("No valid authors found");

  // Non-slugified shortened author display
  let shortAuthorsDisplay;
  if (authorList.length <= MAX_AUTHORS_IN_SLUG) {
    shortAuthorsDisplay = authorList.join("; ");
  } else {
    const firstAuthorLastName = authorList[0].split(",")[0].trim();
    shortAuthorsDisplay = `${firstAuthorLastName} et al.`;
  }

  const authorSlugs = authorList.map((author) => {
    const normalized = normalizeText(author);
    return slugifyText(normalized);
  });

  let combinedAuthorSlug;
  if (authorSlugs.length <= MAX_AUTHORS_IN_SLUG) {
    combinedAuthorSlug = authorSlugs.join("-");
  } else {
    const firstLastName = authorSlugs[0].split("-")[0];
    combinedAuthorSlug = `${firstLastName}-et-al`;
  }

  // =========================
  // Title Processing
  // =========================
  const normalizedTitleText = normalizeText(originalTitle);
  const slugifiedTitle = slugifyText(normalizedTitleText);
  const abbreviatedTitle = applyAbbreviations(slugifiedTitle);
  const yamlSafeTitle = toYamlSafeString(originalTitle);

  // =========================
  // Media Processing
  // =========================
  const mediaSlug = slugifyText(normalizeText(mediaType));

  // =========================
  // Source Processing & Markdown link
  // =========================
  let sourceDomain = "";
  let sourceMarkdownLink = "";

  if (sourceLink) {
    try {
      const url = new URL(sourceLink);
      sourceDomain = url.hostname.replace(/^www\./, "");
    } catch {
      // invalid URL, leave empty
    }

    // Markdown link format: [Authors - Title](URL)
    sourceMarkdownLink = `[${originalAuthors} - ${originalTitle}](${sourceLink})`;
  }

  // =========================
  // Final Output
  // =========================
  const finalSlug = `${combinedAuthorSlug}-${abbreviatedTitle}`;

  // =========================
  // Variables for QuickAdd
  // =========================

  variables.media = mediaType;
  // EX: "articles"

  variables.sourceLink = sourceLink;
  // EX: "https://example.com/article"

  variables.sourceDomain = sourceDomain;
  // EX: "example.com"

  variables.sourceMarkdownLink = sourceMarkdownLink;
  // EX: "[Doe, John; Smith, Jane - Human Resources Training Documentation](https://example.com/article)"

  variables.originalAuthors = originalAuthors;
  // EX: "Doe, John; Smith, Jane; Brown, Bob"

  variables.originalTitle = originalTitle;
  // EX: "Human Resources Training Documentation"

  variables.fullTitle = `${originalAuthors} - ${originalTitle}`;
  // EX: "Doe, John; Smith, Jane - Human Resources Training Documentation"

  variables.authorList = authorList;
  // EX: ["Doe, John", "Smith, Jane", "Brown, Bob"]

  variables.authorSlug = combinedAuthorSlug;
  // EX (≤2 authors): "doe-john-smith-jane"
  // EX (>2 authors): "doe-et-al"

  variables.shortAuthorsDisplay = shortAuthorsDisplay;
  // EX (≤2): "Doe, John; Smith, Jane"
  // EX (>2): "Doe et al."

  variables.shortTitle = `${shortAuthorsDisplay} - ${originalTitle}`;
  // EX: "Doe et al. - Human Resources Training Documentation"

  variables.slugifiedTitle = finalSlug;
  // EX: "doe-et-al-hr-trn-docs"

  variables.fileName = finalSlug;
  // EX: "doe-et-al-hr-trn-docs"

  variables.normalizedTitle = `${authorList.join("; ")} - ${toDisplayName(slugifiedTitle)}`;
  // EX: "Doe, John; Smith, Jane - Human Resources Training Docs"

  variables.yamlSafeTitle = yamlSafeTitle;

  // =========================
  // Notification
  // =========================
  new Notice(`[${mediaType}] "${variables.fullTitle}" → "${finalSlug}"`);

  return finalSlug;
};

/* =========================
   Constants & Abbreviations
   ========================= */
const RESERVED_NAMES = /^(con|prn|aux|nul|com\d|lpt\d)$/;

const abbreviationMap = {
  "project-management": "pm",
  "human-resources": "hr",
  "information-technology": "it",
  "quality-assurance": "qa",
  "frequently-asked-questions": "faq",
  meeting: "mtg",
  training: "trn",
  development: "dev",
  documentation: "docs",
};

const ABBREVIATIONS = Object.entries(abbreviationMap)
  .sort(([a], [b]) => b.length - a.length)
  .map(([key, value]) => ({
    regex: new RegExp(`\\b${key}\\b`, "g"),
    value,
  }));

/* =========================
   Processing Functions
   ========================= */
function normalizeText(text) {
  let normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (RESERVED_NAMES.test(normalized)) {
    normalized = `-${normalized}-`;
  }
  return normalized;
}

function slugifyText(text) {
  return text
    .replace(/[\s_/|\\]+/g, "-")
    .replace(/[^\w.-]+/g, "")
    .replace(/([.-])\1+/g, "$1")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 200);
}

function applyAbbreviations(slug) {
  let result = slug;
  for (const { regex, value } of ABBREVIATIONS) {
    result = result.replace(regex, value);
  }
  return result.replace(/--+/g, "-");
}

function toDisplayName(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function toYamlSafeString(value) {
  return JSON.stringify(value);
}
