import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { db } from "./prisma/db";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api/todos", async (c) => {
  const todos = await db.orm.public.Todo.all();
  return c.json(todos);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
