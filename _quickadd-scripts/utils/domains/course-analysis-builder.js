const AnalysisBuilder = require("../base/analysis-builder");

/**
 * Handles frontmatter generation for course notes.
 */
class AnalysisBuilderCourse extends AnalysisBuilder {
  constructor(quickAddApi) {
    super(quickAddApi);
  }

  getDomainType() {
    return "courses";
  }

  getCreatorFieldId() {
    return "instructor";
  }

  getCreatorFieldLabel() {
    return "Instructor(s) (comma separated)";
  }

  getContentFieldId() {
    return "course";
  }

  getContentFieldLabel() {
    return "Course Name";
  }

  getUnitFieldId() {
    return "module";
  }

  getUnitFieldLabel() {
    return "Module title";
  }

  /**
   * Formats a raw unit identifier string into a standardized module format.
   * 
   * It matches patterns like "Module 1.2:", "1.2", or "Module 3" and normalizes 
   * them into a zero-padded "modXX-YY: " structure.
   *
   * @param {string} text - The raw unit identifier string to format.
   * @returns {string} The formatted unit identifier string.
   * @example
   * // Returns "mod01-02: Introduction"
   * formatUnitIdentifier("Module 1.2: Introduction");
   * 
   * @example
   * // Returns "mod03: Chapter"
   * formatUnitIdentifier("3: Chapter");
   */
  formatUnitIdentifier(text) {
    return text.replace(
      /^(?:Module\s+)?(\d+)(?:\.(\d+))?\s*:?\s*/,
      (_, major, minor) =>
        `mod${major.padStart(2, "0")}${minor ? "-" + minor.padStart(2, "0") : ""}: `,
    );
  }
}

module.exports = AnalysisBuilderCourse;
