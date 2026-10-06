import type { Todo } from "../domain/todo";
import { db } from "../prisma/db";

export class PrismaDriver {
  async getTodos(): Promise<Todo[]> {
    const todos = await db.orm.public.Todo.all();
    return todos;
  }
}
