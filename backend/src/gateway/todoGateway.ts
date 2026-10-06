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

  async createTodo(title: string): Promise<Todo> {
    const todo = await this.driver.createTodo(title);
    return todo;
  }

  async updateTodo(id: number, completed: boolean): Promise<Todo | null> {
    const todo = await this.driver.updateTodo(id, completed);
    return todo;
  }

  async deleteTodo(id: number): Promise<Todo | null> {
    const todo = await this.driver.deleteTodo(id);
    return todo;
  }
}
