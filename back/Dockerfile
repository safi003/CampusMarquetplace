FROM node:22-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
ENV DATABASE_URL="postgresql://docker:docker@localhost:5432/db"
RUN npx prisma generate

FROM node:22-slim AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated
COPY package*.json ./
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY src/ ./src/
RUN mkdir -p uploads && chown -R node:node /app
USER node
EXPOSE 5000
CMD ["npm", "run", "start"]
