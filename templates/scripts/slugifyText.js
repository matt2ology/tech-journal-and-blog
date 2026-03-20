module.exports = async ({ quickAddApi, variables, abort }) => {
  const userInput = await quickAddApi.inputPrompt("Title for post:");
  if (!userInput?.trim()) return abort("No input entered");

  const rawTitle = userInput.trim();

  // === Processing pipeline ===
  const normalizedTitle = normalizeTitle(rawTitle);
  if (!normalizedTitle) return abort("Could not normalize the title");

  const baseSlug = createSlug(normalizedTitle);
  if (!baseSlug) return abort("Could not generate valid slug");

  const finalSlug = abbreviateSlug(baseSlug);

  // === YAML-safe version ===
  const yamlSafeTitle = toYamlSafeString(rawTitle);

  // === Output variables ===
  variables.originalTitle = rawTitle;
  variables.normalizedText = normalizedTitle;
  variables.slugifiedTitle = baseSlug;
  variables.fileName = finalSlug;
  variables.normalizedTitle = formatDisplayTitle(baseSlug);
  variables.yamlSafeTitle = yamlSafeTitle;

  new Notice(`Original: "${rawTitle}" → Slug: "${baseSlug}"`);

  return baseSlug;
};

/* =========================
   Constants
   ========================= */

const WINDOWS_RESERVED_NAMES = /^(con|prn|aux|nul|com\d|lpt\d)$/;

const SLUG_ABBREVIATIONS = {
  // multi-word phrases
  "project-management": "pm",
  "human-resources": "hr",
  "information-technology": "it",
  "quality-assurance": "qa",
  "frequently-asked-questions": "faq",

  // single words
  meeting: "mtg",
  training: "trn",
  development: "dev",
  documentation: "docs"
};

// Precompute abbreviation patterns (longest first)
const ABBREVIATION_PATTERNS = Object.entries(SLUG_ABBREVIATIONS)
  .sort(([a], [b]) => b.length - a.length)
  .map(([phrase, short]) => ({
    pattern: new RegExp(`\\b${phrase}\\b`, "g"),
    replacement: short
  }));

/* =========================
   Processing Functions
   ========================= */

function normalizeTitle(title) {
  let cleaned = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove accents

  if (WINDOWS_RESERVED_NAMES.test(cleaned)) {
    cleaned = `-${cleaned}-`;
  }

  return cleaned;
}

function createSlug(text) {
  return text
    .replace(/[\s_/|\\]+/g, "-")   // separators → hyphen
    .replace(/[^\w.-]+/g, "")      // remove invalid chars
    .replace(/([.-])\1+/g, "$1")   // collapse repeats
    .replace(/^[.-]+|[.-]+$/g, "") // trim edges
    .slice(0, 200);               // limit length
}

function abbreviateSlug(slug) {
  let updatedSlug = slug;

  for (const { pattern, replacement } of ABBREVIATION_PATTERNS) {
    updatedSlug = updatedSlug.replace(pattern, replacement);
  }

  return updatedSlug.replace(/--+/g, "-");
}

function formatDisplayTitle(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/* =========================
   YAML Utility
   ========================= */

function toYamlSafeString(value) {
  // JSON string format is valid YAML and safely escapes everything
  return JSON.stringify(value);
}