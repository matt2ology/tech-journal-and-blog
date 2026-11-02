const SynthesisBuilderBase = require("../base/synthesis-builder-base");

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
}

module.exports = SynthesisBuilderCourse;
