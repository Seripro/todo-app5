FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["sh", "-c", "npx drizzle-kit migrate && npx tsx ./src/drizzle/seed.ts && npm run dev"]