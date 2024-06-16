import type { AstroGlobal } from "astro";
import {
  Cards,
  Sections,
  db,
  eq,
  type CardInsert,
  type CardSelect,
  type SectionInsert,
  type SectionSelect,
} from "astro:db";
import { v7 as uuid } from "uuid";
import type { Message } from "./styles";
import { createAction, editAction, deleteAction } from "./actions";

type CreateResult<T> =
  | { result: "response"; response: Response }
  | {
      result: "render";
      message?: Message;
      data?: T;
    };

type EditOrDeleteResult<T> = {
  action?: typeof editAction | typeof deleteAction;
} & (
  | { result: "response"; response: Response }
  | {
      result: "render";
      message?: Message;
      data?: T;
    }
);

type SectionWithCards = SectionSelect & { cards: CardSelect[] };

const card = {
  create: async function (data: Omit<CardInsert, "id">) {
    const id = uuid();

    const entity: CardInsert = { ...data, id };

    const raw = await db.insert(Cards).values(entity).returning(Cards);

    return raw[0];
  },
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

    return raw[0]!;
  },
  delete: async function (id: CardSelect["id"]) {
    const raw: CardSelect[] = await db.delete(Cards).where(eq(Cards.id, id));

    console.log("deleted", raw);

    return raw[0]!;
  },
  deleteForSection: async function (sectionId: SectionSelect["id"]) {
    const raw: { rowsAffected: number } = await db
      .delete(Cards)
      .where(eq(Cards.sectionId, sectionId));

    return raw;
  },
};

const section = {
  create: async function (data: Omit<SectionInsert, "id">) {
    const id = uuid();

    const entity: SectionInsert = { ...data, id };

    const raw = await db.insert(Sections).values(entity).returning(Sections);

    return raw[0];
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

export function removeId(formData: FormData) {
  if (formData.has("id")) {
    formData.delete("id");
  }
  return formData;
}

export async function handleCreate<T>(
  astro: Readonly<AstroGlobal>,
  sanitizeForm: (formData: FormData) => FormData,
  onCreate: (dto: Omit<T, "id">) => Promise<T>
): Promise<CreateResult<T>> {
  if (astro.request.method === "POST") {
    try {
      let formData = await astro.request.formData();
      for (const [key, value] of formData.entries()) {
        if (!value || value === "") {
          formData.delete(key);
        }
      }
      const action = formData.get("__action");
      formData.delete("__action");
      if (!action) {
        astro.response.status = 400;
        return {
          result: "render",
          message: {
            severity: "error",
            text: "Invalid request",
          },
        };
      } else {
        if (action === createAction) {
          formData = sanitizeForm(formData);
          const dto = Object.fromEntries(formData.entries()) as Parameters<
            typeof onCreate
          >[0];
          const data = await onCreate(dto);

          astro.response.status = 201;
          return {
            result: "render",
            message: {
              severity: "info",
              text: "Create successful",
            },
            data,
          };
        } else {
          astro.response.status = 400;
          return {
            result: "render",
            message: {
              severity: "warning",
              text: "Unknown action",
            },
          };
        }
      }
    } catch (error) {
      astro.response.status = 500;
      if (error instanceof Error) {
        console.error(error.message);
        return {
          result: "render",
          message: {
            severity: "error",
            text: error.message,
          },
        };
      }

      return {
        result: "render",
        message: {
          severity: "error",
          text: "An unexpected error occurred",
        },
      };
    }
  }

  return {
    result: "render",
  };
}

export async function handleEditOrDelete<T extends { id: string }>(
  astro: Readonly<AstroGlobal>,
  id: string,
  sanitizeForm: (formData: FormData) => FormData,
  onEdit: (id: T["id"], dto: Omit<T, "id">) => Promise<T>,
  onDelete: (id: T["id"]) => Promise<T>
): Promise<EditOrDeleteResult<T>> {
  if (astro.request.method === "POST") {
    try {
      let formData = await astro.request.formData();
      for (const [key, value] of formData.entries()) {
        if (!value || value === "") {
          formData.delete(key);
        }
      }
      const action = formData.get("__action");
      formData.delete("__action");
      if (!action) {
        astro.response.status = 400;
        return {
          result: "render",
          message: {
            severity: "error",
            text: "Invalid request",
          },
        };
      } else {
        if (action === editAction) {
          formData = sanitizeForm(formData);
          const dto = Object.fromEntries(formData.entries()) as Parameters<
            typeof onEdit
          >[1];
          const data = await onEdit(id, dto);

          astro.response.status = 201;
          return {
            result: "render",
            message: {
              severity: "info",
              text: "Create successful",
            },
            data,
          };
        } else if (action === deleteAction) {
          await onDelete(id);
          return {
            result: "response",
            response: astro.redirect(import.meta.env.BASE_URL),
          };
        } else {
          astro.response.status = 400;
          return {
            result: "render",
            message: {
              severity: "warning",
              text: "Unknown action",
            },
          };
        }
      }
    } catch (error) {
      astro.response.status = 500;
      if (error instanceof Error) {
        console.error(error.message);
        return {
          result: "render",
          message: {
            severity: "error",
            text: error.message,
          },
        };
      }

      return {
        result: "render",
        message: {
          severity: "error",
          text: "An unexpected error occurred",
        },
      };
    }
  }

  return {
    result: "render",
  };
}
