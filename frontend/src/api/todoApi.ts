const BASE_URL = "http://localhost:3000/api/todos";

export const getTodos = () => {
  return fetch(BASE_URL);
};

export const createTodo = (title: string) => {
  const promise = fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: title }),
  });
  return promise;
};

export const updateTodo = (id: number, completed: boolean) => {
  const promise = fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completed: completed }),
  });
  return promise;
};
