import { Hono } from "hono";
import { cors } from "hono/cors";
import { createTodoRoutes } from "./routes/todoRoutes";
import { todoUseCase } from "./container";

export const createApp = () => {
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

  app.get("/", (c) => c.text("Hello Hono!"));
  app.route("/api/todos", createTodoRoutes(todoUseCase));
  return app;
};
