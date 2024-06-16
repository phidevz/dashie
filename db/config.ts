import { defineDb, defineTable, column } from "astro:db";

const Sections = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    title: column.text(),
    ordinal: column.number({ default: 0 }),
  },
});
const Cards = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    title: column.text(),
    href: column.text(),
    sectionId: column.text({ references: () => Sections.columns.id }),
    iconSrc: column.text({ optional: true }),
  },
});

export default defineDb({
  tables: {
    Sections,
    Cards,
  },
});
