FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM deps AS build
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
COPY data ./data
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
RUN npm prune --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/data ./data
COPY tsconfig.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
