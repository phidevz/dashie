FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
ENV NEXT_TELEMETRY_DISABLED=1

COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base

ENV NODE_ENV="production"
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

ENV CONFIG_FILE=""
ENV NEXT_PUBLIC_HEADING=""

COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules /app/node_modules
COPY --from=build --chown=nextjs:nodejs /app/.next /app/.next

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD [ "pnpm", "start" ]