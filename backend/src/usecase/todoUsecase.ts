import type { Todo } from "../domain/todo";
import type { TodoPort } from "./port/todoPort";

export class TodoUseCase {
  constructor(private readonly todoPort: TodoPort) {}

  async execute(): Promise<Todo[]> {
    const todos = await this.todoPort.getTodos();

    return todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      createdAt: todo.createdAt,
    }));
  }
}
