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

/**
 * Course and lecture note specific frontmatter builder.
 */
class FrontmatterBuilderCourseLectureSeries extends FrontmatterBuilderBase {
  getFields() {
    // Dynamically fetch subfolders 1 level deep from your target folder
    const rawSeriesOptions = VaultQueryService.getSubfolderNames(
      app,
      "course-lecture", // Change this to your target root folder path if needed
    );
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

  processValues(values) {
    const formattedSeries = values.series
      ? TextFormatter.titleCase(values.series)
      : "";

    let lecturer = values.lecturer;
    let fileCount = 0;

    // Automatically fetch lecturer/instructor and count files in the selected series folder
    if (formattedSeries) {
      const rootFolder = "course-lecture";
      const subfolders = VaultQueryService.getSubfolderNames(app, rootFolder);

      // Find the matching subfolder name in the vault
      const matchedSubfolder = subfolders.find(
        (sub) =>
          TextFormatter.titleCase(sub) === formattedSeries ||
          sub.toLowerCase() === formattedSeries.toLowerCase(),
      );

      if (matchedSubfolder) {
        const seriesFolderPath = `${rootFolder}/${matchedSubfolder}`;

        // Count existing markdown files in the series folder
        const filesInFolder = app.vault
          .getMarkdownFiles()
          .filter((file) => file.path.startsWith(seriesFolderPath));
        fileCount = filesInFolder.length;

        // Query existing notes in the series folder for lecturer or instructor fields
        const existingLecturers = VaultQueryService.getFieldValues(
          app,
          "lecturer",
          seriesFolderPath,
        );
        const existingInstructors = VaultQueryService.getFieldValues(
          app,
          "instructor",
          seriesFolderPath,
        );

        const allInstructors = [
          ...new Set([...existingLecturers, ...existingInstructors]),
        ];

        // If existing notes specify a lecturer/instructor and the current value is empty, auto-populate it
        if (allInstructors.length > 0 && !lecturer) {
          lecturer = allInstructors[0];
        }
      }
    }

    // Generate incremented padded filename (e.g., 01-lecture-topic-title)
    const indexNumber = String(fileCount + 1).padStart(2, "0");
    const titleSlug = TextFormatter.slugify(values.title);
    const incrementedFilename = `${indexNumber}-${titleSlug}`;

    return {
      ...values,
      series: formattedSeries,
      lecturer: lecturer
        ? TextFormatter.titleCase(lecturer)
        : "Lecturer Not Listed",
      categories: this.appendToList(values.categories, "courses-lecture"),
      slug: titleSlug,
      title: TextFormatter.titleCase(values.title),
      filename: incrementedFilename,
      foldername: TextFormatter.slugify(values.series)
    };
  }

  buildExtraProperties(values) {
    return [
      `series: "${values.series || "Series Not Listed"}"`,
      `lecturer: "${values.lecturer}"`,
    ];
  }
}

module.exports = FrontmatterBuilderCourseLectureSeries;
