import { describe, expect, test } from "vitest";
import type { TodoPort } from "../usecase/port/todoPort";
import { TodoUseCase } from "../usecase/todoUsecase";

const mockDataForGet = [
  {
    id: 1,
    title: "勉強",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "洗濯",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

const mockPort: TodoPort = {
  getTodos: async () => {
    return mockDataForGet;
  },
  createTodo: async (title: string) => ({
    id: 3,
    title: title,
    completed: false,
    createdAt: new Date().toISOString(),
  }),
  updateTodo: async (id: number, completed: boolean) => ({
    id: id,
    title: "掃除",
    completed: completed,
    createdAt: new Date().toISOString(),
  }),
  deleteTodo: async (id: number) => ({
    id: id,
    title: "読書",
    completed: false,
    createdAt: new Date().toISOString(),
  }),
};

describe("getTodos", () => {
  test("todoが配列で取得できる", async () => {
    const useCase = new TodoUseCase(mockPort);
    const todos = await useCase.getTodos();
    expect(todos).toEqual(mockDataForGet);
  });
});
