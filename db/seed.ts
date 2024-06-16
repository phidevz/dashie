import { db, Sections, Cards } from "astro:db";

export default async function () {
  for (let section = 1; section <= 4; section++) {
    await db
      .insert(Sections)
      .values([{ id: `s${section}`, title: `Test Section ${section}` }]);

      for (let round = 0; round < ((section - 1) % 3 === 0 ? 3 : 1); round++) {
        await db.insert(Cards).values([
          {
            id: `s${section}c${round * 4 + 1}`,
            title: "Documentation",
            sectionId: `s${section}`,
            href: "https://docs.astro.build/",
          },
          {
            id: `s${section}c${round * 4 + 2}`,
            title: "Integrations",
            sectionId: `s${section}`,
            href: "https://astro.build/integrations/",
          },
          {
            id: `s${section}c${round * 4 + 3}`,
            title: "Themes",
            sectionId: `s${section}`,
            href: "https://astro.build/themes/",
          },
          {
            id: `s${section}c${round * 4 + 4}`,
            title: "Community",
            sectionId: `s${section}`,
            href: "https://astro.build/chat/",
          },
        ]);
      }
  }
}
