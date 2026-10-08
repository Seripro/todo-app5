import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";
import { getTodos } from "../api/todoApi";

vi.mock("../api/todoApi.ts", () => ({
  getTodos: vi.fn().mockResolvedValue({
    json: async () => [
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
    ],
  } as Response),
  createTodo: vi.fn((title: string) =>
    Promise.resolve({
      id: 3,
      title: title,
      completed: false,
      createdAt: "2026-10-05",
    }),
  ),
  updateTodo: vi.fn((id: number, completed: boolean) =>
    Promise.resolve({
      id: id,
      title: "掃除",
      completed: completed,
      createdAt: "2026-10-05",
    }),
  ),
  deleteTodo: vi.fn((id: number) =>
    Promise.resolve({
      id: id,
      title: "読書",
      completed: false,
      createdAt: "2026-10-05",
    }),
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("App.tsxのテスト", () => {
  test("todoの入力欄がある", async () => {
    render(<App />);
    const input = await screen.findByPlaceholderText("タイトル");
    expect(input).toBeDefined();
  });
});
describe("Todoの取得", () => {
  test("Todoが表示されている", async () => {
    render(<App />);
    const title1 = await screen.findByText("勉強");
    const title2 = await screen.findByText("洗濯");
    expect(title1).toBeDefined();
    expect(title2).toBeDefined();
  });
  test("Todoの取得に失敗する", async () => {
    // ここのテストケースだけgetTodosのモックを書き換える
    vi.mocked(getTodos).mockResolvedValue({
      json: async () => ({
        error: "Failed to fetch todos",
      }),
    } as Response);
    render(<App />);
    const error = await screen.findByText("Failed to fetch todos");
    expect(error).toBeDefined();
  });
});
