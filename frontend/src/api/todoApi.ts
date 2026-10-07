const BASE_URL = "http://localhost:3000/api/todos";

export const getTodos = async () => {
  return fetch(BASE_URL);
};
