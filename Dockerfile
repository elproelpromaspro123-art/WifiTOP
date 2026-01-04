# Build Next.js
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código
COPY . .

# Build Next.js
RUN npm run build

# Runtime
FROM node:20-alpine

WORKDIR /app

# Instalar speedtest-cli desde Alpine repos
RUN apk add --no-cache speedtest-cli

# Copiar package.json
COPY package*.json ./

# Instalar dependencias de runtime
RUN npm ci --production

# Copiar built Next.js app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Copiar server.js
COPY server.js .

# Exponer puerto 3000 (Next.js)
EXPOSE 3000

# Iniciar ambos serviços
CMD npm run start & node server.js & wait
