FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile || bun install

FROM deps AS builder

COPY . .

RUN bun run build

FROM nginx:alpine AS production

RUN apk update && apk upgrade --no-cache && apk add --no-cache dumb-init

RUN rm -rf /usr/share/nginx/html/* && \
    rm /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["nginx", "-g", "daemon off;"]
