const NoteBuilderBase = require("../base/note-builder-base");

/**
 * Handles frontmatter generation for course capture notes.
 */
class NoteBuilderCourse extends NoteBuilderBase {
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

  getUnitFieldId() {
    return "lecture";
  }

  getUnitFieldLabel() {
    return "Lecture title";
  }
}

module.exports = NoteBuilderCourse;
