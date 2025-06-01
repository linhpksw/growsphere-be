# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install
COPY ./src ./src
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/server.js"]
