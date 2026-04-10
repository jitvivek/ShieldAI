# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma/
RUN npx prisma generate

COPY src ./src/

RUN npm run build

# Development stage (hot reload with ts-node)
FROM node:20-alpine AS dev

RUN apk add --no-cache curl openssl

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma/
RUN npx prisma generate

COPY src ./src/

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000 9229

CMD ["npx", "nodemon", "--exec", "node --inspect=0.0.0.0:9229 -r ts-node/register", "src/index.ts"]

# Production stage
FROM node:20-alpine AS production

RUN apk add --no-cache curl openssl

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma/

# Rules directory is mounted via Docker Compose volumes
# See docker-compose.yml for the volume mount configuration

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
