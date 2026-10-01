export const restaurantPrice = {
  name: "restaurantPrice",
  title: "Prislista restaurang",
  type: "document",
  initialValue: {
    isSoldOut: false,
    isAllocated: false,
  },
  preview: {
    select: {
      title: "wine",
      vintage: "vintage",
      subtitle: "producer",
    },
    prepare({ title, vintage, subtitle }) {
      return {
        title: [title, vintage].filter(Boolean).join(" ") || "Vin utan namn",
        subtitle,
      };
    },
  },
  fields: [
    {
      name: "producer",
      title: "Producent",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "wine",
      title: "Vin",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    { name: "vintage", title: "Årgång", type: "string" },
    {
      name: "wineColor",
      title: "Vintyp",
      type: "string",
      description: "Frivilligt. Välj rött eller vitt vin.",
      options: {
        list: [
          { title: "Rött", value: "Rött" },
          { title: "Vitt", value: "Vitt" },
        ],
      },
    },
    {
      name: "isSoldOut",
      title: "Slutsåld",
      type: "boolean",
      initialValue: false,
      description: "Markera för att visa 'Slutsåld' i stället för priset.",
      validation: (Rule) =>
        Rule.custom((value, context) =>
          value === true && context.document?.isAllocated === true
            ? "Välj antingen Slutsåld eller Allokering, inte båda."
            : true,
        ),
    },
    {
      name: "isAllocated",
      title: "Allokering",
      type: "boolean",
      initialValue: false,
      description: "Markera för att visa 'Allokering' i stället för priset.",
      validation: (Rule) =>
        Rule.custom((value, context) =>
          value === true && context.document?.isSoldOut === true
            ? "Välj antingen Allokering eller Slutsåld, inte båda."
            : true,
        ),
    },
    {
      name: "bottle",
      title: "Flaska",
      type: "string",
      description:
        "Frivilligt. Ange flaskstorleken i ml med enbart siffror, till exempel 750.",
      validation: (Rule) =>
        Rule.custom(
          (value) =>
            !value ||
            (typeof value === "string" && /^\d+$/.test(value.trim())) ||
            "Ange storleken i ml med enbart siffror, till exempel 750.",
        ),
    },
    {
      name: "price",
      title: "Pris",
      type: "string",
      description:
        "Ange pris i kronor. Lämna tomt om Slutsåld eller Allokering är markerad.",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (
            (context.document?.isSoldOut === true ||
              context.document?.isAllocated === true) &&
            !value
          ) {
            return true;
          }

          return (
            (typeof value === "string" &&
              (/^\d+$/.test(value.trim()) ||
                /^(allokering|slutsåld)$/i.test(value.trim()))) ||
            "Ange ett pris i kronor eller markera en status."
          );
        }),
    },
    { name: "notes", title: "Notering", type: "text", rows: 3 },
  ],
};
