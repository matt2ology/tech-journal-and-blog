module.exports = async ({ quickAddApi, variables, abort }) => {
  const input = await quickAddApi.inputPrompt("Title for post:");
  if (!input?.trim()) return abort("No input entered");

  const rawInput = input.trim();

  // === Build slug ===
  const slug = buildSlug(rawInput);
  if (!slug) return abort("Could not generate valid slug");

  // === Output variables ===
  // "a guide to project management" (nothing changed)
  variables.originalTitle = rawInput;

  // "a guide to project management" -> "a-guide-to-pm"
  variables.slug = slug;

  // "information technology update" -> "it-update"
  variables.fileName = slug;

  // "a guide to project management" -> "A Guide to PM"
  variables.displayTitle = formatDisplayTitle(slug);

  // "frequently asked questions in HR" -> "FAQ in HR"
  variables.yamlSafeTitle = toYamlSafeString(rawInput);

  new Notice(`"${rawInput}" → "${slug}"`);

  return slug;
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
  documentation: "docs",
};

const ABBREVIATION_PATTERNS = Object.entries(SLUG_ABBREVIATIONS)
  .sort(([a], [b]) => b.length - a.length)
  .map(([phrase, short]) => ({
    pattern: new RegExp(`\\b${phrase}\\b`, "g"),
    replacement: short,
  }));

const SMALL_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "in",
  "nor", "of", "on", "or", "per", "the", "to", "via", "vs",
]);

const FORCE_UPPER = new Set(["api", "ai", "qa", "hr", "it"]);

/* =========================
   Core Pipeline
   ========================= */

function buildSlug(title) {
  const base = slugify(title);
  if (!base) return null;

  return abbreviateSlug(base);
}

function slugify(title) {
  let text = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (WINDOWS_RESERVED_NAMES.test(text)) {
    text = `-${text}-`;
  }

  return text
    .replace(/[\s_/|\\]+/g, "-")
    .replace(/[^\w.-]+/g, "")
    .replace(/([.-])\1+/g, "$1")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 200);
}

function abbreviateSlug(slug) {
  return ABBREVIATION_PATTERNS.reduce(
    (acc, { pattern, replacement }) => acc.replace(pattern, replacement),
    slug,
  ).replace(/--+/g, "-");
}

/* =========================
   Display Formatting
   ========================= */

function formatDisplayTitle(slug) {
  const words = slug.split("-").filter(Boolean);
  const last = words.length - 1;

  return words
    .map((word, i) => {
      if (FORCE_UPPER.has(word)) return word.toUpperCase();

      if (i !== 0 && i !== last && SMALL_WORDS.has(word)) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/* =========================
   YAML Utility
   ========================= */

function toYamlSafeString(value) {
  return JSON.stringify(value);
}
