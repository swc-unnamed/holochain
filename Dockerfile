FROM oven/bun:1.3 AS build

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
WORKDIR /app

COPY . .

RUN bun install --ignore-scripts

RUN bun run build

RUN rm -rf ./node_modules

RUN bun install --production --ignore-scripts

FROM oven/bun:1.3 AS runtime
WORKDIR /app
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build

ENV NODE_ENV="production"

EXPOSE 3000
CMD ["bun", "/app/build/index.js"]