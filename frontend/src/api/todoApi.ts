const BASE_URL = "http://localhost:3000/api/todos";

export const getTodos = async () => {
  return fetch(BASE_URL);
};

export const createTodo = async (title: string) => {
  const promise = fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: title }),
  });
  return promise;
};
