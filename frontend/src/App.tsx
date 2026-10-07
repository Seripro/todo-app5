import { useEffect, useState } from "react";
import "./App.css";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
};

const BASE_URL = "http://localhost:3000/api/todos";

function App() {
  const [title, setTitle] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rawRes = await fetch(BASE_URL);
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
    const rawRes = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify({ title: title }),
    });
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
  };

  const handleDelete = async (id: number) => {
    const rawRes = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
    const res = await rawRes.json();
    if (res.error) {
      setError(res.error);
      return;
    } else {
      const newTodos = todos.filter((todo) => todo.id !== id);
      setTodos(newTodos);
    }
  };

  const handleToggle = async (id: number, completed: boolean) => {
    const rawRes = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: !completed }),
    });
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
      {error ? <p>{error}</p> : null}
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
