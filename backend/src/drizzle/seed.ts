import { db } from "./client";
import { todosTable } from "./schema";

for (const title of ["勉強", "掃除", "買い物"]) {
  await db.insert(todosTable).values({
    title,
    completed: false,
    createdAt: new Date(),
    updatedAt: null,
  });
}
