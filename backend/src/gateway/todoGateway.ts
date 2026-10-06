import type { Todo } from "../domain/todo";
import type { TodoDriver } from "../driver/todoDriver";
import type { TodoPort } from "../usecase/port/todoPort";

export class TodoGateway implements TodoPort {
  constructor(private readonly driver: TodoDriver) {}

  async getTodos(): Promise<Todo[]> {
    const todos = await this.driver.getTodos();
    return todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      createdAt: todo.createdAt,
    }));
  }
}
