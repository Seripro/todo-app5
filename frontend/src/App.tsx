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
        const rawRes = await getTodos();
        const res = await rawRes.json();
        if (res.error) {
          setError(res.error);
        } else {
          setTodos(res);
        }
      } catch {
        setError("Todoの取得に失敗しました");
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
        const rawRes = await createTodo(title);
        const res = await rawRes.json();
        if (res.error) {
          setError(res.error);
          return;
        } else {
          const newTodo: Todo = res;
          const newTodos: Todo[] = [...todos, newTodo];
          setTodos(newTodos);
          setTitle("");
          setError("");
        }
      } catch {
        setError("Todo登録に失敗しました");
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const rawRes = await deleteTodo(id);
      const res = await rawRes.json();
      if (res.error) {
        setError(res.error);
        return;
      } else {
        const newTodos = todos.filter((todo) => todo.id !== id);
        setTodos(newTodos);
      }
    } catch {
      setError("Todo削除に失敗しました");
    }
  };

  const handleToggle = async (id: number, completed: boolean) => {
    try {
      const rawRes = await updateTodo(id, !completed);
      const res = await rawRes.json();
      if (res.error) {
        setError(res.error);
      } else {
        const newTodos: Todo[] = todos.map((todo) => ({
          id: todo.id,
          title: todo.title,
          completed: todo.id === id ? !todo.completed : todo.completed,
          createdAt: todo.createdAt,
        }));
        setTodos(newTodos);
      }
    } catch {
      setError("Todo更新に失敗しました");
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
      {error ? <p test-id="error">{error}</p> : null}
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
