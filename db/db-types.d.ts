import { Sections, Cards } from "astro:db";

declare module "astro:db" {
  export type SectionSelect = typeof Sections.$inferSelect;
  export type SectionInsert = typeof Sections.$inferInsert;
  export type CardSelect = typeof Cards.$inferSelect;
  export type CardInsert = typeof Cards.$inferInsert;
}
