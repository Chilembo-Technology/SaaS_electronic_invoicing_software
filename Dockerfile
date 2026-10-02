# ==========================================================
# Stage 1 — Build do React com Vite
# ==========================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile; \
    else npm install; fi

COPY . .

RUN npm run build

# ==========================================================
# Stage 2 — Nginx serve estáticos + reverse proxy
# ==========================================================
FROM nginx:alpine

RUN rm -f /etc/nginx/conf.d/default.conf

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/conf.d   /etc/nginx/conf.d
COPY --from=builder /app/dist /var/www/frontend

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]