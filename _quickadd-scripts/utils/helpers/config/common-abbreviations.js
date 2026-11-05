/**
 * Dictionary of common abbreviations and their clean slug equivalents.
 */
const abbreviations = {
  "A.M.": "am",
  "Artificial Intelligence": "ai",
  "Augmented Reality": "ar",
  "Big Data": "bigdata",
  "Cloud Computing": "cloud",
  "Computer Vision": "cv",
  "Cryptocurrency": "crypto",
  "Data Science": "ds",
  "Deep Learning": "dl",
  "Internet of Things": "iot",
  "Machine Learning": "ml",
  "Natural Language Processing": "nlp",
  "P.M.": "pm",
  "Quantum Computing": "quantum",
  "Virtual Reality": "vr",
  "Generative": "gen",
  "Leadership": "ldrshp",
};

// Safeguard check: Ensure no duplicate values or key collisions occur
const values = Object.values(abbreviations);
const uniqueValues = new Set(values);

if (values.length !== uniqueValues.size) {
  throw new Error(
    "Configuration Error: Duplicate values detected in common-abbreviations.js!",
  );
}

module.exports = Object.freeze(abbreviations);
