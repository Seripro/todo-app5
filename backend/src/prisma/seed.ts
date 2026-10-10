import { db } from "./db";

for (const title of ["勉強", "掃除", "買い物"]) {
  await db.orm.public.Todo.create({
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  });
}

await db.close();
