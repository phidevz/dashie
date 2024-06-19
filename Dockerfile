FROM node:lts-slim AS base
WORKDIR /usr/local/src/app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm && corepack use pnpm@9
COPY package.json pnpm-lock.yaml ./

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN ASTRO_DATABASE_FILE=/srv/dashie.db pnpm build

FROM node:lts-slim AS runtime
WORKDIR /srv

COPY --from=prod-deps /usr/local/src/app/node_modules /app/node_modules
COPY --from=build /srv/dashie.db /srv/dashie.db
COPY --from=build /usr/local/src/app/dist /app

ENV ASTRO_DATABASE_FILE=/srv/dashie.db
ENV HOST=0.0.0.0
ENV PORT=3333
EXPOSE 3333
CMD node /app/server/entry.mjs