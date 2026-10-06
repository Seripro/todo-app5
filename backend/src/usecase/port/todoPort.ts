import type { Todo } from "../../domain/todo";

export interface TodoPort {
  getTodos(): Promise<Todo[]>;
  createTodo(title: string): Promise<Todo>;
  updateTodo(id: number, completed: boolean): Promise<Todo | null>;
}
