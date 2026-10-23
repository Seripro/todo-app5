import type { Todo } from "../domain/todo";
import { db } from "../drizzle/client";
import { todosTable } from "../drizzle/schema";
import type { TodoDriver } from "./todoDriver";
import { eq } from "drizzle-orm";

export class DrizzleDriver implements TodoDriver {
  async getTodos(): Promise<Todo[]> {
    const drizzleTodos = await db.select().from(todosTable);
    const todos = drizzleTodos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      createdAt: todo.createdAt.toISOString(),
    }));
    return todos;
  }

  async createTodo(title: string): Promise<Todo> {
    const newTodo = {
      title: title,
      completed: false,
      createdAt: new Date(),
    };
    const created = await db.insert(todosTable).values(newTodo).returning();
    return {
      id: created[0].id,
      title: created[0].title,
      completed: created[0].completed,
      createdAt: created[0].createdAt.toISOString(),
    };
  }

  async updateTodo(id: number, completed: boolean): Promise<Todo | null> {
    const updated = await db
      .update(todosTable)
      .set({
        completed: completed,
        updatedAt: new Date(),
      })
      .where(eq(todosTable.id, id))
      .returning();

    const todo = updated[0];
    if (!todo) return null;
    return {
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      createdAt: todo.createdAt.toISOString(),
    };
  }

  async deleteTodo(id: number): Promise<Todo | null> {
    const deleted = await db
      .delete(todosTable)
      .where(eq(todosTable.id, id))
      .returning();

    const todo = deleted[0];
    if (!todo) return null;
    return {
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      createdAt: todo.createdAt.toISOString(),
    };
  }
}
