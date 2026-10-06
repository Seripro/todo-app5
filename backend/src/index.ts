import { serve } from "@hono/node-server";
import { Hono } from "hono";
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
  const created = await todoUseCase.createTodo(title);
  return c.json(created, 201);
});

app.patch("/api/todos/:id", async (c) => {
  const strId = await c.req.param("id");
  const id = Number(strId);
  const { completed } = await c.req.json();
  const updated = await todoUseCase.updateTodo(id, completed);
  if (updated) {
    return c.json({ id: id, message: "Updated successfully" }, 200);
  } else {
    return c.json({ error: "Todo not found" }, 404);
  }
});

app.delete("/api/todos/:id", async (c) => {
  const strId = await c.req.param("id");
  const id = Number(strId);
  const deleted = await todoUseCase.deleteTodo(id);
  if (deleted) {
    return c.json({ id: id, message: "Deleted successfully" }, 200);
  } else {
    return c.json({ error: "Todo not found" }, 404);
  }
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
