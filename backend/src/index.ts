import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { db } from "./prisma/db";
import { cors } from "hono/cors";

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
  const todos = await db.orm.public.Todo.all();
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

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
