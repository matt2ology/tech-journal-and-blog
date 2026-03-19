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
  // Slug combining media, authors, and abbreviated title
  // Example: "articles-doe-et-al-hr-trn-docs"
  const finalSlug = `${mediaSlug}-${combinedAuthorSlug}-${abbreviatedTitle}`;

  // Store all outputs in variables for QuickAdd/templating
  variables.media = mediaType;
  variables.sourceLink = sourceLink;
  variables.sourceDomain = sourceDomain;
  variables.sourceMarkdownLink = sourceMarkdownLink;

  variables.originalAuthors = originalAuthors;
  variables.originalTitle = originalTitle;
  variables.fullTitle = `${originalAuthors} - ${originalTitle}`;

  variables.authorList = authorList;
  variables.authorSlug = combinedAuthorSlug;

  variables.slugifiedTitle = finalSlug;
  variables.fileName = finalSlug;

  // Human-readable display
  variables.normalizedTitle = `${authorList.join("; ")} - ${toDisplayName(slugifiedTitle)}`;

  // Quick notification in Obsidian
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
