import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { db } from "./prisma/db";
import { cors } from "hono/cors";
import { todoUseCase } from "./container";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api/todos", async (c) => {
  const todos = await todoUseCase.getTodos();
  return c.json(todos);
});

app.post("/api/todos", async (c) => {
  const { title } = await c.req.json<{ title: string }>();
  const newTodo = {
    title: title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  const created = await db.orm.public.Todo.create(newTodo);
  return c.json(created, 201);
});

app.patch("/api/todos/:id", async (c) => {
  const strId = await c.req.param("id");
  const id = Number(strId);
  const { completed } = await c.req.json();
  const updated = await db.orm.public.Todo.where({ id: id }).update({
    completed: completed,
  });
  return c.json({ id: id, message: "Updated successfully" }, 200);
});

app.delete("/api/todos/:id", async (c) => {
  const strId = await c.req.param("id");
  const id = Number(strId);
  const deleted = await db.orm.public.Todo.where({ id: id }).delete();
  return c.json({ id, message: "Delete successfully" });
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
