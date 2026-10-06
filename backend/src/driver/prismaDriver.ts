import type { Todo } from "../domain/todo";
import { db } from "../prisma/db";
import type { TodoDriver } from "./todoDriver";

export class PrismaDriver implements TodoDriver {
  async getTodos(): Promise<Todo[]> {
    const todos = await db.orm.public.Todo.all();
    return todos;
  }
}
