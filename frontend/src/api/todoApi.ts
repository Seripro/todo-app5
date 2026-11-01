import type { Todo } from "../domain/todo";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/api/todos`;

async function request<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.error?.message ?? "API request failed");
  }

  return body as T;
}

export const getTodos = () => {
  return request<Todo[]>(BASE_URL);
};

export const createTodo = (title: string) => {
  return request<Todo>(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: title }),
  });
};

export const updateTodo = (id: number, completed: boolean) => {
  return request<Todo>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completed: completed }),
  });
};

export const deleteTodo = (id: number) => {
  return request<void>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
};
