export const restaurantPage = {
  name: "restaurantPage",
  title: "Restaurangkund",
  type: "document",
  initialValue: {
    pageTitle: "För restaurangkunder",
    contactPrompt: "För beställning av viner,",
    contactLinkLabel: "kontakta oss",
  },
  fields: [
    {
      name: "pageTitle",
      title: "Rubrik på sidan",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(90),
    },
    {
      name: "contactPrompt",
      title: "Text före kontaktlänken",
      type: "string",
      description: "Exempel: För beställning av viner,",
      validation: (Rule) => Rule.required().min(3).max(120),
    },
    {
      name: "contactLinkLabel",
      title: "Text på kontaktlänken",
      type: "string",
      description: "Länken leder till kontaktuppgifterna längst ned på sidan.",
      validation: (Rule) => Rule.required().min(2).max(40),
    },
    {
      name: "priceIntro",
      title: "Text ovanför prislistan",
      type: "text",
      rows: 4,
      description: "Visas under rubriken Restauranger och ovanför prislistan.",
      validation: (Rule) => Rule.required().min(20),
    },
    {
      name: "intro",
      title: "Text under rubriken Våra restaurangkunder",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required().min(20),
    },
  ],
};
