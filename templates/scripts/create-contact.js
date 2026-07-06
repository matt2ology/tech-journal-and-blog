module.exports = async (params) => {
    const { quickAddApi } = params;

    const values = await quickAddApi.requestInputs([
        {
            id: "firstName",
            label: "First Name",
            type: "text",
        },
        {
            id: "middleName",
            label: "Middle Name (Optional)",
            type: "text",
        },
        {
            id: "lastName",
            label: "Last Name (Optional)",
            type: "text",
        },
        {
            id: "birthday",
            label: "Birthday (Optional)",
            type: "date",
            dateFormat: "YYYY-MM-DD",
        },
        {
            id: "dateMet",
            label: "Date Met (Optional)",
            type: "date",
            dateFormat: "YYYY-MM-DD",
        },
    ]);

    if (!values) return; // User cancelled

    // Trim whitespace from all string inputs
    for (const key in values) {
        if (typeof values[key] === "string") {
            values[key] = values[key].trim();
        }
    }

    // Full name
    values.personalFullName = [
        values.firstName,
        values.middleName,
        values.lastName,
    ]
        .filter(Boolean)
        .join(" ");

    // "Last, First" if a last name exists
    values.sirName = values.lastName
        ? `${values.lastName}, ${values.firstName}`
        : values.firstName;

    // Slugify first + last name for filename
    values.fileName = [
        values.firstName,
        values.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    params.variables = values;
};