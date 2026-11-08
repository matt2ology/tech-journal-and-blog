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
  "Generative": "gen",
  "Internet of Things": "iot",
  "Large Language Model": "llm",
  "Large Language Models": "llms",
  "Leadership": "ldrshp",
  "Machine Learning": "ml",
  "Natural Language Processing": "nlp",
  "P.M.": "pm",
  "Quantum Computing": "quantum",
  "Retrieval-Augmented Generation": "rag",
  "Virtual Reality": "vr",
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
