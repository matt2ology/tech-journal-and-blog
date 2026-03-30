module.exports = async ({ quickAddApi: qa, variables, abort }) => {
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
  } catch {
    return abort("Input cancelled by user");
  }

  const originalTitle = values.title?.trim();
  const authorsRaw = values.authors?.trim();
  const mediaType = values.media?.trim() || "unknown";
  const sourceLink = values.source?.trim() || "";

  if (!originalTitle) return abort("Missing title");
  if (!authorsRaw) return abort("Missing authors");

  // =========================
  // Author processing
  // =========================
  const MAX_AUTHORS_IN_SLUG = 2;
  const authorList = authorsRaw
    .split(";")
    .map((a) => a.trim())
    .filter(Boolean);
  if (authorList.length === 0) return abort("No valid authors found");

  const shortAuthorsDisplay =
    authorList.length <= MAX_AUTHORS_IN_SLUG
      ? authorList.join("; ")
      : `${authorList[0].split(",")[0]} et al.`;

  const authorSlugs = authorList.map((a) => buildSlug(a));
  const combinedAuthorSlug =
    authorSlugs.length <= MAX_AUTHORS_IN_SLUG
      ? authorSlugs.join("-")
      : `${authorSlugs[0].split("-")[0]}-et-al`;

  // =========================
  // Title processing
  // =========================
  const abbreviatedTitle = buildSlug(originalTitle);
  const yamlSafeTitle = toYamlSafeString(originalTitle);

  // =========================
  // Source processing
  // =========================
  let sourceDomain = "";
  let sourceMarkdownLink = "";
  if (sourceLink) {
    try {
      sourceDomain = new URL(sourceLink).hostname.replace(/^www\./, "");
      sourceMarkdownLink = `[${authorsRaw} - ${originalTitle}](${sourceLink})`;
    } catch {}
  }

  // =========================
  // Final slug and display title
  // =========================
  const finalSlug = `${combinedAuthorSlug}-${abbreviatedTitle}`;
  const displayTitle = `${shortAuthorsDisplay} - ${toDisplayName(abbreviatedTitle)}`;

  // =========================
  // Output variables
  // =========================
  variables.media = mediaType;
  variables.sourceLink = sourceLink;
  variables.sourceDomain = sourceDomain;
  variables.sourceMarkdownLink = sourceMarkdownLink;
  variables.originalAuthors = authorsRaw;
  variables.originalTitle = originalTitle;
  variables.fullTitle = `${authorsRaw} - ${originalTitle}`;
  variables.authorList = authorList;
  variables.authorSlug = combinedAuthorSlug;
  variables.shortAuthorsDisplay = shortAuthorsDisplay;
  variables.shortTitle = displayTitle;
  variables.slugifiedTitle = finalSlug;
  variables.fileName = finalSlug;
  variables.displayTitle = displayTitle;
  variables.yamlSafeTitle = yamlSafeTitle;

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
  .map(([key, value]) => ({ regex: new RegExp(`\\b${key}\\b`, "g"), value }));

const SMALL_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "in",
  "nor", "of", "on", "or", "per", "the", "to", "via", "vs",
]);
const FORCE_UPPER = new Set(["api", "ai", "qa", "hr", "it"]);

/* =========================
   Processing functions
   ========================= */
function normalizeText(text) {
  let normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (RESERVED_NAMES.test(normalized)) normalized = `-${normalized}-`;
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
  return ABBREVIATIONS.reduce(
    (s, { regex, value }) => s.replace(regex, value),
    slug,
  ).replace(/--+/g, "-");
}

function buildSlug(text) {
  const normalized = normalizeText(text);
  const slug = slugifyText(normalized);
  return applyAbbreviations(slug);
}

function toDisplayName(slug) {
  const words = slug.split("-").filter(Boolean);
  const last = words.length - 1;
  return words
    .map((w, i) => {
      if (FORCE_UPPER.has(w)) return w.toUpperCase();
      if (i !== 0 && i !== last && SMALL_WORDS.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function toYamlSafeString(value) {
  return JSON.stringify(value);
}
