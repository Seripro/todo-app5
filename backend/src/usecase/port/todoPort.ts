import type { Todo } from "../../domain/todo";

export interface TodoPort {
  getTodos(): Promise<Todo[]>;
}
