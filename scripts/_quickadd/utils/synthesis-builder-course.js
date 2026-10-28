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

  getResourceType() {
    return "courses";
  }

  getNameFieldId() {
    return "instructor";
  }

  getNameFieldLabel() {
    return "Instructor(s) (comma separated)";
  }

  getItemFieldId() {
    return "course";
  }

  getItemFieldLabel() {
    return "Course Name";
  }
}

module.exports = SynthesisBuilderCourse;
