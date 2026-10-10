const API_URL = import.meta.env.VITE_API_URL;

export const getTodos = () => {
  return fetch(`${API_URL}/api/todos`);
};

export const createTodo = (title: string) => {
  const promise = fetch(`${API_URL}/api/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: title }),
  });
  return promise;
};

export const updateTodo = (id: number, completed: boolean) => {
  const promise = fetch(`${API_URL}/api/todos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completed: completed }),
  });
  return promise;
};

export const deleteTodo = (id: number) => {
  const promise = fetch(`${API_URL}/api/todos/${id}`, {
    method: "DELETE",
  });
  return promise;
};
