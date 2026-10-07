import { beforeEach, describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";

describe("App.tsxのテスト", () => {
  beforeEach(() => {
    render(<App />);
  });
  test("todoの入力欄がある", async () => {
    const input = await screen.findByPlaceholderText("タイトル");
    expect(input).toBeDefined();
  });
});
