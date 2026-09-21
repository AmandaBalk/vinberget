export const producer = {
  name: "producer",
  title: "Producent",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Namn",
      type: "string",
      validation: (Rule) => Rule.required().min(2),
    },
    {
      name: "slug",
      title: "Slug (URL-namn)",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "origin",
      title: "Land/region",
      type: "string",
      description: "Exempel: Frankrike, Bourgogne eller Tyskland, Mosel.",
      validation: (Rule) => Rule.required().min(2).max(120),
    },
    {
      name: "heroImage",
      title: "Toppbild",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "imageCaption",
      title: "Bildtext",
      type: "string",
      description: "Frivillig text som visas under producentbilden.",
    },
    {
      name: "additionalImages",
      title: "Fler bilder",
      type: "array",
      description:
        "Frivilligt. Lägg till fler bilder för en redaktionell bildsättning.",
      of: [
        {
          type: "object",
          name: "producerAdditionalImage",
          title: "Bild",
          fields: [
            {
              name: "image",
              title: "Bild",
              type: "image",
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            },
            {
              name: "caption",
              title: "Bildtext",
              type: "string",
              description: "Frivillig.",
            },
          ],
        },
      ],
    },
    {
      name: "intro",
      title: "Presentation",
      type: "text",
      rows: 6,
      validation: (Rule) => Rule.required().min(30),
    },
    {
      name: "vineyard",
      title: "I vingården",
      type: "text",
      rows: 6,
      validation: (Rule) => Rule.required().min(20),
    },
    {
      name: "cellar",
      title: "I källaren",
      type: "text",
      rows: 6,
      validation: (Rule) => Rule.required().min(20),
    },
    {
      name: "wines",
      title: "Om vinerna",
      type: "text",
      rows: 6,
      validation: (Rule) => Rule.required().min(20),
    },
  ],
};
