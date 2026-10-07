import { describe, expect, test, vi } from "vitest";
import type { TodoPort } from "../usecase/port/todoPort";
import { TodoUseCase } from "../usecase/todoUsecase";

const mockDataForGet = [
  {
    id: 1,
    title: "勉強",
    completed: false,
    createdAt: "2026-10-05",
  },
  {
    id: 2,
    title: "洗濯",
    completed: false,
    createdAt: "2026-10-05",
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
    createdAt: "2026-10-05",
  }),
  updateTodo: async (id: number, completed: boolean) => ({
    id: id,
    title: "掃除",
    completed: completed,
    createdAt: "2026-10-05",
  }),
  deleteTodo: async (id: number) => ({
    id: id,
    title: "読書",
    completed: false,
    createdAt: "2026-10-05",
  }),
};

describe("getTodos", () => {
  test("todoが配列で取得できる", async () => {
    const useCase = new TodoUseCase(mockPort);
    const todos = await useCase.getTodos();
    expect(todos).toEqual(mockDataForGet);
  });
});
describe("createTodo", () => {
  test("作成したtodoが返ってくる", async () => {
    const title = "勉強";
    const mockDataForCreate = {
      id: 3,
      title: title,
      completed: false,
      createdAt: "2026-10-05",
    };
    const useCase = new TodoUseCase(mockPort);
    const created = await useCase.createTodo(title);
    expect(created).toEqual(mockDataForCreate);
  });
});
describe("updateTodo", () => {
  test("更新したtodoが返ってくる", async () => {
    const id = 1;
    const completed = true;
    const mockDataForUpdate = {
      id: id,
      title: "掃除",
      completed: completed,
      createdAt: "2026-10-05",
    };
    const useCase = new TodoUseCase(mockPort);
    const updated = await useCase.updateTodo(id, completed);
    expect(updated).toStrictEqual(mockDataForUpdate);
  });
  test("更新するデータがない場合、nullが返ってくる", async () => {
    const id = 1;
    const completed = true;
    const updateTodo = vi.fn().mockResolvedValue(null);
    const useCase = new TodoUseCase({
      ...mockPort,
      updateTodo,
    });
    const updated = await useCase.updateTodo(id, completed);
    expect(updated).toBeNull();
  });
});
