const path = require("path");

module.exports = async (params) => {
  const { app } = params;
  const vaultPath = app.vault.adapter.getBasePath();

  const { buildFrontmatter } = require(
    path.join(
      vaultPath,
      "scripts",
      "_quickadd",
      "utils",
      "frontmatter-base.js",
    ),
  );

  return buildFrontmatter(params, [
    {
      fields: [
        {
          id: "author",
          label: "Author",
          type: "text",
          placeholder: "Enter author name...",
          defaultValue: "matt2ology",
        },
      ],

      contribute: ({ inputs, properties, variables }) => {


        return {
          append: {
            categories: ["naruto-bleach"],
          },

          add: {
            author: inputs.author?.trim() || "added",
            type: "article",
          },

          // Publish additional workflow variables.
          variables: {
            author: inputs.author?.trim() || "wut",
            noteType: "article",
          },
        };
      },
    },
  ]);
};
