import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { createTodo, deleteTodo, getTodos, updateTodo } from "../api/todoApi";

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
      json: async () => ({
        id,
        title: "掃除",
        completed,
        createdAt: "2026-10-05",
      }),
    } as Response),
  ),
  deleteTodo: vi.fn((id: number) =>
    Promise.resolve({
      json: async () => ({
        id: id,
        title: "読書",
        completed: false,
        createdAt: "2026-10-05",
      }),
    } as Response),
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getTodos).mockResolvedValue({
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
  } as Response);
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
  test("タイトルが空の場合、エラーメッセージが表示される", async () => {
    render(<App />);

    const user = userEvent.setup();
    const input = await screen.findByPlaceholderText("タイトル");
    await user.type(input, "宿題");
    const button = await screen.findByText("追加");
    await user.click(button);

    const dbError = await screen.queryByText("タイトルを入力してください");
    expect(dbError).toBeDefined();
  });
});
describe("Todoの更新", () => {
  test("Todoの更新に成功する", async () => {
    render(<App />);
    const user = userEvent.setup();
    const checkbox = (await screen.findAllByRole(
      "checkbox",
    )) as HTMLInputElement[];
    await user.click(checkbox[0]);
    expect(updateTodo).toHaveBeenCalledWith(1, true);
    const checkboxAfterClick = (await screen.findAllByRole(
      "checkbox",
    )) as HTMLInputElement[];
    expect(checkboxAfterClick[0].checked).toBe(true);
  });
  test("Todoの更新に失敗する", async () => {
    vi.mocked(updateTodo).mockResolvedValue({
      json: async () => ({
        error: "Failed to update todo",
      }),
    } as Response);
    render(<App />);
    const user = userEvent.setup();
    const checkbox = (await screen.findAllByRole(
      "checkbox",
    )) as HTMLInputElement[];
    await user.click(checkbox[0]);
    const error = await screen.findByText("Failed to update todo");
    expect(error).toBeDefined();
  });
});
describe("Todoの削除", () => {
  test("Todoの削除に成功する", async () => {
    render(<App />);
    const user = userEvent.setup();
    const buttons = await screen.findAllByRole("button", { name: "削除" });
    await user.click(buttons[0]);
    expect(deleteTodo).toHaveBeenCalledWith(1);

    const error = await screen.queryByTestId("error");
    expect(error).toBeNull();
  });
  test("Todoの削除に失敗する", async () => {
    vi.mocked(deleteTodo).mockResolvedValue({
      json: async () => ({ error: "Failed to delete todo" }),
    } as Response);
    render(<App />);
    const user = userEvent.setup();
    const buttons = await screen.findAllByRole("button", { name: "削除" });
    await user.click(buttons[0]);
    const error = await screen.queryByTestId("error");
    expect(error).toBeDefined();
  });
});
