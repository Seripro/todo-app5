import type { Todo } from "../domain/todo";
import { db } from "../prisma/db";
import type { TodoDriver } from "./todoDriver";

export class PrismaDriver implements TodoDriver {
  async getTodos(): Promise<Todo[]> {
    const todos = await db.orm.public.Todo.all();
    return todos;
  }

  async createTodo(title: string): Promise<Todo> {
    const newTodo = {
      title: title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const created = await db.orm.public.Todo.create(newTodo);
    return created;
  }

  async updateTodo(id: number, completed: boolean): Promise<Todo | null> {
    const updated = await db.orm.public.Todo.where({ id: id }).update({
      completed: completed,
    });
    return updated;
  }
}
