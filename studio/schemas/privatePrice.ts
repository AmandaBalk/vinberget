export const privatePrice = {
  name: "privatePrice",
  title: "Prislista privatkund",
  type: "document",
  fields: [
    {
      name: "producer",
      title: "Producent",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    { name: "region", title: "Region", type: "string" },
    {
      name: "wine",
      title: "Vin",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    { name: "vintage", title: "Årgång", type: "string" },
    {
      name: "bottle",
      title: "Flaska",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "price",
      title: "Pris",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    { name: "notes", title: "Notering", type: "text", rows: 3 },
  ],
};
