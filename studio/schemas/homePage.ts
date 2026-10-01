export const homePage = {
  name: "homePage",
  title: "Hem",
  type: "document",
  fields: [
    {
      name: "siteName",
      title: "Webbplatsnamn",
      type: "string",
      validation: (Rule) => Rule.required().min(2),
    },
    {
      name: "tagline",
      title: "Huvudrubrik",
      type: "string",
      description: "Stor rubrik på startsidan.",
      validation: (Rule) => Rule.required().min(8).max(90),
    },
    {
      name: "heroText",
      title: "Introduktionstext",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required().min(30).max(320),
    },
    {
      name: "homeImage",
      title: "Bild på startsidan",
      type: "image",
      options: { hotspot: true },
      description: "Visas ovanför rubriken på startsidan.",
    },
  ],
};
