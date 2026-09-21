export const restaurant = {
  name: "restaurant",
  title: "Restaurangkunder lista",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Namn",
      type: "string",
      validation: (Rule) => Rule.required().min(2),
    },
    { name: "city", title: "Ort", type: "string" },
    {
      name: "description",
      title: "Kort beskrivning",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required().min(10),
    },
  ],
};
