FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["sh", "-c", "npx prisma contract emit && npx prisma db init && npx tsx src/prisma/seed.ts && npm run dev"]