import {
  Cards,
  Sections,
  db,
  eq,
  type CardSelect,
  type SectionInsert,
  type SectionSelect,
} from "astro:db";
import { v4 as uuid } from "uuid";

type SectionWithCards = SectionSelect & { cards: CardSelect[] };

const card = {
  findById: async (id: CardSelect["id"]) => {
    const raw: CardSelect[] = await db
      .select()
      .from(Cards)
      .where(eq(Cards.id, id));

    if (raw.length === 0 || !raw[0]) {
      return null;
    }

    return raw[0];
  },
  listForSection: async function (sectionId: SectionSelect["id"]) {
    const raw: CardSelect[] = await db
      .select()
      .from(Cards)
      .where(eq(Cards.sectionId, sectionId))
      .orderBy(Cards.id);

    return raw;
  },
  update: async function (
    id: CardSelect["id"],
    updateDto: Partial<Omit<CardSelect, "id">>
  ) {
    const raw: CardSelect[] = await db
      .update(Cards)
      .set(updateDto)
      .where(eq(Cards.id, id))
      .returning(Cards);

    return raw[0];
  },
  delete: async function (id: CardSelect["id"]) {
    const raw: CardSelect[] = await db.delete(Cards).where(eq(Cards.id, id));

    console.log("deleted", raw);

    return raw[0];
  },
  deleteForSection: async function (sectionId: SectionSelect["id"]) {
    const raw: {rowsAffected: number} = await db
      .delete(Cards)
      .where(eq(Cards.sectionId, sectionId));

    return raw;
  },
};

const section = {
  create: async function (
    title: SectionInsert["title"],
    ordinal: SectionInsert["ordinal"]
  ) {
    const id = uuid();

    const entity: SectionInsert = {
      id,
      title,
      ordinal,
    };
  },
  findById: async (id: SectionSelect["id"]) => {
    const raw: SectionSelect[] = await db
      .select()
      .from(Sections)
      .where(eq(Sections.id, id));

    if (raw.length === 0 || !raw[0]) {
      return null;
    }

    return raw[0];
  },
  list: async function () {
    const raw: SectionSelect[] = await db
      .select()
      .from(Sections)
      .orderBy(Sections.ordinal, Sections.id);
    return raw;
  },
  listWithCards: async function () {
    const raw: {
      Sections: SectionSelect;
      Cards: CardSelect;
    }[] = await db
      .select()
      .from(Sections)
      .leftJoin(Cards, eq(Sections.id, Cards.sectionId))
      .orderBy(Sections.ordinal, Sections.id, Cards.id);

    const result: SectionWithCards[] = [
      ...raw
        .reduce((acc, row) => {
          const section = row.Sections;
          const card = row.Cards;
          if (!acc.has(section.id)) {
            acc.set(section.id, { ...section, cards: [] });
          }
          if (card) {
            acc.get(section.id)!.cards.push(card);
          }
          return acc;
        }, new Map<SectionSelect["id"], SectionWithCards>())
        .values(),
    ];

    return result;
  },
  update: async function (
    id: SectionSelect["id"],
    updateDto: Partial<Omit<SectionSelect, "id">>
  ) {
    const raw: SectionSelect[] = await db
      .update(Sections)
      .set(updateDto)
      .where(eq(Sections.id, id))
      .returning(Sections);

    return raw[0];
  },
  delete: async function (id: SectionSelect["id"]) {
    await card.deleteForSection(id);

    const raw: { rowsAffected: number } = await db
      .delete(Sections)
      .where(eq(Sections.id, id));

    return raw;
  },
};

export default {
  section,
  card,
};
