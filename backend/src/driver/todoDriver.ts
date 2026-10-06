import type { Todo } from "../domain/todo";

export interface TodoDriver {
  getTodos(): Promise<Todo[]>;
  createTodo(title: string): Promise<Todo>;
}
