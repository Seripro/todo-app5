import { Hono } from "hono";
import { createTodoHandlers } from "../handlers/todoHandlers";
import { TodoUseCase } from "../usecase/todoUsecase";

export const createTodoRoutes = (todoUseCase: TodoUseCase) => {
  const router = new Hono();
  const handlers = createTodoHandlers(todoUseCase);
  router.get("/", handlers.getTodos);
  router.post("/", handlers.createTodo);
  router.patch("/:id", handlers.updateTodo);
  router.delete("/:id", handlers.deleteTodo);
  return router;
};
