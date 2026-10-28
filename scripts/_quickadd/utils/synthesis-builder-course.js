const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const SynthesisBuilderBase = require("./synthesis-builder-base");

/**
 * Handles frontmatter generation for course synthesis notes.
 */
class SynthesisBuilderCourse extends SynthesisBuilderBase {
  constructor(quickAddApi) {
    super(quickAddApi);
  }

  getCategoryType() {
    return "courses";
  }

  getPersonNameFieldId() {
    return "instructor";
  }

  getPersonNameFieldLabel() {
    return "Instructor(s) (comma separated)";
  }

  getContentFieldId() {
    return "course";
  }

  getContentFieldLabel() {
    return "Course Name";
  }
}

module.exports = SynthesisBuilderCourse;
