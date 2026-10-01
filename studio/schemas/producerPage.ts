export const producerPage = {
  name: "producerPage",
  title: "Våra producenter",
  type: "document",
  initialValue: {
    pageTitle: "Vinproducenter",
  },
  preview: {
    select: {
      title: "pageTitle",
      subtitle: "intro",
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Vinproducenter",
        subtitle,
      };
    },
  },
  fields: [
    {
      name: "pageTitle",
      title: "Rubrik på sidan",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(90),
    },
    {
      name: "intro",
      title: "Introduktion till producentöversikten",
      type: "text",
      rows: 3,
      description: "Texten som visas under rubriken Våra producenter.",
    },
  ],
};
