import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { createTodo, getTodos } from "../api/todoApi";

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
      json: async () => ({
        id: 3,
        title,
        completed: false,
        createdAt: "2026-10-05",
      }),
    } as Response),
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
describe("Todoの登録", () => {
  test("Todoの登録が成功する", async () => {
    render(<App />);
    const user = userEvent.setup();
    const input = await screen.findByPlaceholderText("タイトル");
    await user.type(input, "宿題");
    const button = await screen.findByText("追加");
    await user.click(button);

    screen.debug();
    const titleError = await screen.queryByText("Title is required");
    const dbError = await screen.queryByText("Failed to add todo");
    expect(createTodo).toHaveBeenCalledWith("宿題");
    expect(titleError).toBeNull();
    expect(dbError).toBeNull();
  });
  test("Todoの登録に失敗する", async () => {
    vi.mocked(createTodo).mockResolvedValue({
      json: async () => ({ error: "Failed to add todo" }),
    } as Response);
    render(<App />);

    const user = userEvent.setup();
    const input = await screen.findByPlaceholderText("タイトル");
    await user.type(input, "宿題");
    const button = await screen.findByText("追加");
    await user.click(button);

    const dbError = await screen.queryByText("Failed to add todo");
    expect(dbError).toBeDefined();
  });
});
