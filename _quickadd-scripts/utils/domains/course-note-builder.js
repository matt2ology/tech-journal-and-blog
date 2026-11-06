const NoteBuilder = require("../base/note-builder");

/**
 * Handles frontmatter generation for course notes.
 */
class NoteBuilderCourse extends NoteBuilder {
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

  getSectionFieldId() {
    return "lesson";
  }

  getSectionFieldLabel() {
    return "Lesson title";
  }

  formatUnitIdentifier(text) {
    return text.replace(
      /^(?:Module\s+)?(\d+)(?:\.(\d+))?\s*:?\s*/,
      (_, major, minor) =>
        `mod${major.padStart(2, "0")}${minor ? "-" + minor.padStart(2, "0") : ""}: `,
    );
  }
}

module.exports = NoteBuilderCourse;
