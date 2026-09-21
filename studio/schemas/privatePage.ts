export const privatePage = {
  name: "privatePage",
  title: "Privatkundssida",
  type: "document",
  fields: [
    {
      name: "intro",
      title: "Privatimportstext",
      type: "text",
      rows: 10,
      description:
        "Texten visas på privatkundssidan ovanför beställningsstegen.",
      validation: (Rule) => Rule.required().min(20),
    },
    {
      name: "orderSteps",
      title: "Beställningssteg",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.required().min(1),
    },
    {
      name: "priceListTitle",
      title: "Rubrik för prislista",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
  ],
};
