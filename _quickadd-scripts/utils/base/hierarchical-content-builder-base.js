const ContentBuilderBase = require("./content-builder-base");
const VaultQueryService = require("../services/vault-query-service");

class HierarchicalContentBuilderBase extends ContentBuilderBase {
  getSectionFieldId() {
    throw new Error("Derived classes must implement getSectionFieldId()");
  }

  getUnitFieldId() {
    throw new Error("Derived classes must implement getUnitFieldId()");
  }

  getSectionFieldId() {
    return this.getSectionFieldId();
  }

  getUnitFieldId() {
    return this.getUnitFieldId();
  }

  getSectionFieldLabel() {
    return "Section (Part/Section/Lesson)";
  }

  getUnitFieldLabel() {
    return "Unit (Title/Chapter/Module)";
  }

  extractContentFields(values) {
    const baseFields = super.extractContentFields(values);
    const sectionField = this.getSectionFieldId();
    const unitField = this.getUnitFieldId();

    return {
      ...baseFields,
      sectionFieldId: sectionField,
      unitFieldId: unitField,
      sectionValue: values[sectionField] || "",
      unitValue: values[unitField] || "",
    };
  }

  getFields() {
    const unitOptions = VaultQueryService.getFieldValues({
      app,
      fieldName: this.getUnitFieldId(),
      folderPath: `${this.getKnowledgeResourceType()}/${this.getDomainType()}`,
    });
    const baseFields = super.getFields();
    return [
      baseFields[0],
      {
        id: this.getUnitFieldId(),
        label: this.getUnitFieldLabel(),
        type: "suggester",
        placeholder: "Enter unit (Title/Chapter/Module)",
        defaultValue: "",
        options: unitOptions,
        suggsterConfig: {
          allowCustom: true,
          caseSensitive: false,
          multiSelect: false,
        },
      },
      {
        id: this.getSectionFieldId(),
        label: this.getSectionFieldLabel(),
        type: "text",
        placeholder: "Enter section (Part/Section/Lesson)",
        defaultValue: "",
        optional: true,
      },
      baseFields[1],
    ];
  }
}

module.exports = HierarchicalContentBuilderBase;
