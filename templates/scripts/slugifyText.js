module.exports = async (params) => {
  const { quickAddApi: qa, variables, abort } = params;

  const input = await qa.inputPrompt("Enter meeting/training title:");
  if (!input?.trim()) return abort("No input entered");

  const originalTitle = input.trim();

  // === Processing pipeline ===
  const normalizedText = normalizeText(originalTitle);
  if (!normalizedText) return abort("Could not normalize the title");

  const slugifiedTitle = slugifyText(normalizedText);
  if (!slugifiedTitle) return abort("Could not generate valid slug");

  const abbreviatedSlug = applyAbbreviations(slugifiedTitle);

  // === Output variables ===
  // Raw user input (unchanged) - "Human Resources / Training Session"
  variables.originalTitle = originalTitle;
  // Normalized (lowercase, accents removed) -"human resources / training session"
  variables.normalizedText = normalizedText;
  // Slugified (separators → hyphens, cleaned) - "human-resources-training-session"
  variables.slugifiedTitle = slugifiedTitle;
  // Abbreviated (mapped phrases/words replaced) - "hr-training-session"
  variables.fileName = abbreviatedSlug;
  // Human-readable version (for display/UI) - "Human Resources Training Session"
  variables.normalizedTitle = toDisplayName(slugifiedTitle);

  new Notice(`Original: "${originalTitle}" → Slug: "${slugifiedTitle}"`);

  return slugifiedTitle;
};

/* =========================
   Constants
   ========================= */

const RESERVED_NAMES = /^(con|prn|aux|nul|com\d|lpt\d)$/;

const abbreviationMap = {
  // multi-word phrases
  "project-management": "pm",
  "human-resources": "hr",
  "information-technology": "it",
  "quality-assurance": "qa",
  "frequently-asked-questions": "faq",

  // single words
  "meeting": "mtg",
  "training": "trn",
  "development": "dev",
  "documentation": "docs"
};

// Precompute abbreviation regex (sorted longest first)
const ABBREVIATIONS = Object.entries(abbreviationMap)
  .sort(([a], [b]) => b.length - a.length)
  .map(([key, value]) => ({
    regex: new RegExp(`\\b${key}\\b`, "g"),
    value
  }));

/* =========================
   Processing Functions
   ========================= */

function normalizeText(text) {
  let normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove accents

  if (RESERVED_NAMES.test(normalized)) {
    normalized = `-${normalized}-`;
  }

  return normalized;
}

function slugifyText(text) {
  return text
    .replace(/[\s_/|\\]+/g, "-")     // separators → hyphen
    .replace(/[^\w.-]+/g, "")        // remove invalid chars
    .replace(/([.-])\1+/g, "$1")     // collapse repeats
    .replace(/^[.-]+|[.-]+$/g, "")   // trim edges
    .slice(0, 200);                 // limit length
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
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}