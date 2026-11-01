import { useEffect, useState } from "react";
import "./App.css";
import type { Todo } from "./domain/todo";
import { createTodo, deleteTodo, getTodos, updateTodo } from "./api/todoApi";

function App() {
  const [title, setTitle] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const todos = await getTodos();
        setTodos(todos);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Todoの取得に失敗しました",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!title || !title.trim()) {
      setError("タイトルを入力してください");
    } else {
      try {
        const todo = await createTodo(title);
        const newTodos: Todo[] = [...todos, todo];
        setTodos(newTodos);
        setTitle("");
        setError("");
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Todoの登録に失敗しました",
        );
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTodo(id);
      const newTodos = todos.filter((todo) => todo.id !== id);
      setTodos(newTodos);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Todoの削除に失敗しました",
      );
    }
  };

  const handleToggle = async (id: number, completed: boolean) => {
    try {
      const updatedTodo = await updateTodo(id, !completed);
      const newTodos: Todo[] = todos.map((todo) => ({
        id: todo.id,
        title: todo.title,
        completed:
          todo.id === updatedTodo.id ? !todo.completed : todo.completed,
        createdAt: todo.createdAt,
      }));
      setTodos(newTodos);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Todoの更新に失敗しました",
      );
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div>
        <input
          placeholder="タイトル"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />
        <button onClick={handleAdd}>追加</button>
      </div>
      {error ? <p data-testid="error">{error}</p> : null}
      <div>
        {todos.map((todo) => {
          return (
            <div key={todo.id}>
              <p>{todo.title}</p>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo.id, todo.completed)}
              />
              <button onClick={() => handleDelete(todo.id)}>削除</button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App;
