module.exports = async (params) => {
    const { quickAddApi } = params;

    const values = await quickAddApi.requestInputs([
        {
            id: "name",
            label: "Name",
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

    if (!values) return;

    const fullName = values.name.trim().replace(/\s+/g, " ");
    const parts = fullName.split(" ");

    let firstName = "";
    let middleName = "";
    let lastName = "";

    if (parts.length === 1) {
        firstName = parts[0];
    } else if (parts.length === 2) {
        [firstName, lastName] = parts;
    } else {
        firstName = parts[0];
        lastName = parts[parts.length - 1];
        middleName = parts.slice(1, -1).join(" ");
    }

    const slugify = (str) =>
        str
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    params.variables = {
        firstName,
        middleName,
        lastName,
        personalFullName: fullName,
        sirName: lastName ? `${lastName}, ${firstName}` : firstName,
        birthday: values.birthday,
        dateMet: values.dateMet,
        fileName: slugify([firstName, lastName].filter(Boolean).join(" ")),
    };
};