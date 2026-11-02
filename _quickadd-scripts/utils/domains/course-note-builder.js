const NoteBuilderBase = require("../base/note-builder-base");

/**
 * Handles frontmatter generation for course notes.
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

  getSectionFieldId() {
    return "course";
  }

  getSectionFieldLabel() {
    throw new Error("Derived classes must implement getSectionFieldLabel()");
  }
}

module.exports = NoteBuilderCourse;
