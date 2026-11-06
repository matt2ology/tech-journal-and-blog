const SynthesisBuilder = require("../base/synthesis-builder");

/**
 * Handles frontmatter generation for course synthesis notes.
 */
class SynthesisBuilderCourse extends SynthesisBuilder {
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
}

module.exports = SynthesisBuilderCourse;
