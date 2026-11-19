# Stage 1: Build
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_WEB_SERVER=localhost
ARG NEXT_PUBLIC_WEB_PORT_BACK_END=8080

ENV NEXT_PUBLIC_WEB_SERVER=$NEXT_PUBLIC_WEB_SERVER
ENV NEXT_PUBLIC_WEB_PORT_BACK_END=$NEXT_PUBLIC_WEB_PORT_BACK_END

RUN mkdir -p public
RUN npm run build

# Stage 2: Runtime
FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]