import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { todoUseCase } from "./container";

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: allowedOrigin,
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api/todos", async (c) => {
  try {
    const todos = await todoUseCase.getTodos();
    return c.json(todos);
  } catch {
    return c.json({ error: "Failed to fetch todos" }, 500);
  }
});

app.post("/api/todos", async (c) => {
  try {
    const { title } = await c.req.json<{ title: string }>();
    if (!title || !title.trim()) {
      return c.json({ error: "Title is required" }, 400);
    }
    const created = await todoUseCase.createTodo(title);
    return c.json(created, 201);
  } catch {
    return c.json({ error: "Failed to add todo" }, 500);
  }
});

app.patch("/api/todos/:id", async (c) => {
  try {
    const strId = await c.req.param("id");
    const id = Number(strId);
    const { completed } = await c.req.json();
    const updated = await todoUseCase.updateTodo(id, completed);
    if (updated) {
      return c.json({ id: id, message: "Updated successfully" }, 200);
    } else {
      return c.json({ error: "Todo not found" }, 404);
    }
  } catch {
    return c.json({ error: "Failed to update todo" }, 500);
  }
});

app.delete("/api/todos/:id", async (c) => {
  try {
    const strId = await c.req.param("id");
    const id = Number(strId);
    const deleted = await todoUseCase.deleteTodo(id);
    if (deleted) {
      return c.json({ id: id, message: "Deleted successfully" }, 200);
    } else {
      return c.json({ error: "Todo not found" }, 404);
    }
  } catch {
    return c.json({ error: "Failed to delete todo" }, 500);
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
