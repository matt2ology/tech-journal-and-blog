const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const TextFormatter = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "text-formatter"),
);
const FrontmatterBuilderBase = require(
  path.join(
    vaultPath,
    "scripts",
    "_quickadd",
    "utils",
    "frontmatter-builder-base",
  ),
);
const VaultQueryService = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "vault-query-service"),
);
const IncrementedFilenameUtility = require(
  path.join(
    vaultPath,
    "scripts",
    "_quickadd",
    "utils",
    "file-counter-utility",
  ),
);

/**
 * Course and lecture note specific frontmatter builder.
 */
class FrontmatterBuilderCourseLectureSeries extends FrontmatterBuilderBase {
  getFields() {
    const rawSeriesOptions = VaultQueryService.getSubfolderNames({
      app,
      folderPath: "course-lecture",
    });
    const processedSeriesOptions = rawSeriesOptions.map((series) =>
      TextFormatter.titleCase(series),
    );

    return [
      {
        id: "series",
        label: "Course / Lecture Series",
        type: "suggester",
        options: processedSeriesOptions,
        placeholder: "Select course or lecture series if listed",
        defaultValue: "",
        suggesterConfig: {
          displayValues: processedSeriesOptions,
          allowCustomInput: true,
          caseSensitive: false,
          multiSelect: false,
        },
      },
      {
        id: "title",
        label: "Lecture / Topic Title",
        type: "text",
        placeholder: "Enter lecture or note title",
        defaultValue: "",
      },
      {
        id: "lecturer",
        label: "Lecturer / Instructor",
        type: "text",
        placeholder: "Who is teaching this? (Auto-detected if left default)",
        defaultValue: "",
      },
      {
        id: "tags",
        label: "Tags (comma separated)",
        type: "text",
        placeholder: "tag1, tag2",
        defaultValue: "",
      },
    ];
  }

  #getInstructorLastNames(instructorString) {
    if (!instructorString) return "unknown";

    const cleanString = TextFormatter.cleanWikiLink(instructorString);
    const authors = cleanString.split(",");

    const lastNames = authors
      .map((author) => {
        const trimmed = author.trim();
        const nameParts = trimmed.split(/\s+/);
        const lastName = nameParts[nameParts.length - 1];
        return lastName.replace(/[^a-zA-Z]/g, "") || "unknown";
      })
      .filter(Boolean);

    return lastNames.length > 0 ? lastNames.join("-") : "unknown";
  }

  processValues(values) {
    const formattedSeries = values.series
      ? TextFormatter.titleCase(values.series)
      : "";

    let lecturerInput = values.lecturer ? values.lecturer.trim() : "";

    const resolvedContext = this.#resolveSeriesContext({
      formattedSeries,
      lecturerInput,
    });

    lecturerInput = resolvedContext.lecturerInput;
    const folderName = resolvedContext.folderName;

    const incrementedFilename = IncrementedFilenameUtility.generate({
      app,
      folderPath: "course-lecture",
      seriesName: values.series,
      title: values.title,
    });

    return {
      ...values,
      series: formattedSeries,
      lecturer: lecturerInput,
      categories: this.appendToList({
        list: values.categories,
        items: ["courses-lecture"],
      }),
      slug: TextFormatter.slugify(values.title),
      title: TextFormatter.titleCase(values.title),
      filename: incrementedFilename,
      foldername: folderName,
      lectureSeriesReference: `${values.series} - ${TextFormatter.titleCase(values.title)} by ${TextFormatter.formatPlainNaturalNameList(lecturerInput)}`,
    };
  }

  #resolveSeriesContext({ formattedSeries, lecturerInput }) {
    const rootFolder = "course-lecture";
    const subfolders = VaultQueryService.getSubfolderNames({
      app,
      folderPath: rootFolder,
    });

    const matchedSubfolder = subfolders.find(
      (sub) =>
        TextFormatter.titleCase(sub) === formattedSeries ||
        sub.toLowerCase() === formattedSeries.toLowerCase(),
    );

    if (!matchedSubfolder) {
      const instructorLastNames = this.#getInstructorLastNames(lecturerInput);
      const seriesSlug = TextFormatter.slugify(formattedSeries);
      return {
        lecturerInput,
        folderName: TextFormatter.slugify(
          `${instructorLastNames}-${seriesSlug}`,
        ),
      };
    }

    let resolvedLecturer = lecturerInput;
    if (!resolvedLecturer) {
      const seriesFolderPath = `${rootFolder}/${matchedSubfolder}`;
      const existingLecturers = VaultQueryService.getFieldValues({
        app,
        fieldName: "lecturer",
        folderPath: seriesFolderPath,
      });
      const existingInstructors = VaultQueryService.getFieldValues({
        app,
        fieldName: "instructor",
        folderPath: seriesFolderPath,
      });

      const allInstructors = [
        ...new Set([...existingLecturers, ...existingInstructors]),
      ].filter(Boolean);

      if (allInstructors.length > 0) {
        resolvedLecturer = allInstructors
          .map((instructor) => TextFormatter.cleanWikiLink(instructor))
          .join(", ");
      }
    }

    return {
      lecturerInput: resolvedLecturer,
      folderName: matchedSubfolder,
    };
  }

  buildExtraProperties({ values }) {
    return [
      `series: "${values.series || "Series Not Listed"}"`,
      `lecturer:${this.formatNameList(values.lecturer, '"Lecturer Not Listed"')}`,
    ];
  }
}

module.exports = FrontmatterBuilderCourseLectureSeries;
