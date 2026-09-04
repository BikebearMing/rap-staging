// Works. Placeholder until it comes from WordPress. A project has one
// `variant` per service it was delivered as (Event Design, Landscaping...),
// each with its own photo; a pill over the image switches between them when
// there is more than one. `tags` are the project's own tags. On the project
// page `overview` is one string per paragraph and `gallery` is laid out in
// rows of one wide image then two half images (see .work-gallery).
const overview = [
  "A tailored planting design developed for Cortina Watch, integrating tropical greenery with its contemporary spatial identity.",
  "The installation enhances the environment through considered plant selection, composition, and placement.",
];

const gallery = ["/hp-banner-1.png", "/slider-4.jpg", "/slider-5.jpg", "/service-image-2.png"];

export const works = [
  {
    slug: "innisfree",
    title: "Innisfree",
    year: "2026",
    date: "Oct 2026",
    variants: [
      { category: "Event Design", image: "/slider-2.jpg" },
      { category: "Landscaping", image: "/service-image-2.png" },
    ],
    tags: ["Event Design", "Installation", "Planning"],
    description:
      "The existing space was surrounded by contemporary architecture and hard surfaces, creating a functional environment but one that lacked warmth and visual connection with nature.",
    overview,
    gallery,
  },
  {
    slug: "cortina-watch",
    title: "Cortina Watch",
    year: "2026",
    date: "Oct 2026",
    variants: [{ category: "Event Design", image: "/slider-3.jpg" }],
    tags: ["Installation", "Planning"],
    description:
      "The existing space was surrounded by contemporary architecture and hard surfaces, creating a functional environment but one that lacked warmth and visual connection with nature.",
    overview,
    gallery,
  },
  {
    slug: "formula-one",
    title: "Formula One",
    year: "2026",
    date: "Sep 2026",
    variants: [{ category: "Event Design", image: "/slider-4.jpg" }],
    tags: ["Event Design", "Installation", "Planning"],
    description:
      "The existing space was surrounded by contemporary architecture and hard surfaces, creating a functional environment but one that lacked warmth and visual connection with nature.",
    overview,
    gallery,
  },
  {
    slug: "dior",
    title: "Dior",
    year: "2026",
    date: "Aug 2026",
    variants: [{ category: "Event Design", image: "/slider-5.jpg" }],
    tags: ["Event Design", "Installation", "Planning"],
    description:
      "The existing space was surrounded by contemporary architecture and hard surfaces, creating a functional environment but one that lacked warmth and visual connection with nature.",
    overview,
    gallery,
  },
];
