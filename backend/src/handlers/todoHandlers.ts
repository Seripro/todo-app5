import type { Context } from "hono";
import type { TodoUseCase } from "../usecase/todoUsecase";

export const createTodoHandlers = (todoUseCase: TodoUseCase) => {
  return {
    getTodos: async (c: Context) => {
      try {
        const todos = await todoUseCase.getTodos();
        return c.json(todos);
      } catch {
        return c.json({ error: { message: "Failed to fetch todos" } }, 500);
      }
    },
    createTodo: async (c: Context) => {
      try {
        const { title } = await c.req.json<{ title: string }>();
        if (!title || !title.trim()) {
          return c.json({ error: { message: "Title is required" } }, 400);
        }
        const created = await todoUseCase.createTodo(title.trim());
        return c.json(created, 201);
      } catch {
        return c.json({ error: { message: "Failed to add todo" } }, 500);
      }
    },
    updateTodo: async (c: Context) => {
      try {
        const strId = await c.req.param("id");
        const id = Number(strId);
        const { completed } = await c.req.json();
        const updated = await todoUseCase.updateTodo(id, completed);
        if (updated) {
          return c.json(updated, 200);
        } else {
          return c.json({ error: { message: "Todo not found" } }, 404);
        }
      } catch {
        return c.json({ error: { message: "Failed to update todo" } }, 500);
      }
    },
    deleteTodo: async (c: Context) => {
      try {
        const strId = await c.req.param("id");
        const id = Number(strId);
        const deleted = await todoUseCase.deleteTodo(id);
        if (deleted) {
          return c.body(null, 204);
        } else {
          return c.json({ error: { message: "Todo not found" } }, 404);
        }
      } catch {
        return c.json({ error: { message: "Failed to delete todo" } }, 500);
      }
    },
  };
};
