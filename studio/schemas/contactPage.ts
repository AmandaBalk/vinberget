export const contactPage = {
  name: "contactPage",
  title: "Kontakt",
  type: "document",
  fields: [
    {
      name: "email",
      title: "E-post",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    },
    {
      name: "instagramUrl",
      title: "Instagram-länk",
      type: "url",
      validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }),
    },
    {
      name: "linkedinUrl",
      title: "LinkedIn-länk",
      type: "url",
      validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }),
    },
    {
      name: "newsletterTitle",
      title: "Rubrik i nyhetsbrevspopup",
      type: "string",
      validation: (Rule) => Rule.required().min(2),
    },
    {
      name: "newsletterText",
      title: "Text i nyhetsbrevspopup",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required().min(20).max(220),
    },
    {
      name: "newsletterCtaLabel",
      title: "Knapptext i nyhetsbrevspopup",
      type: "string",
      validation: (Rule) => Rule.required().min(3).max(40),
    },
    {
      name: "newsletterEmbedUrl",
      title: "Mailchimp-formulärets action-URL",
      type: "url",
      description:
        "Klistra in form action-URL från Mailchimp embed-koden, till exempel https://.../subscribe/post?u=...&id=...",
      validation: (Rule) => Rule.uri({ scheme: ["http", "https"] }),
    },
  ],
};
