export const aboutPage = {
  name: "aboutPage",
  title: "Om oss",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Rubrik",
      type: "string",
      validation: (Rule) => Rule.required().min(2),
    },
    {
      name: "body",
      title: "Text",
      type: "text",
      rows: 8,
      validation: (Rule) => Rule.required().min(40),
    },
    {
      name: "image",
      title: "Bild",
      type: "image",
      options: { hotspot: true },
    },
  ],
};
