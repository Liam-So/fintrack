import { api } from "../axios";

export const fetchUserData = (user) => (api.get(`user/${user.nickname}`));

export const fetchTransactions = () => (api.get("/transactions"));

export const fetchCategoryPercentages = () => (api.get("/categories/percentages"));

export const postCalculateCategoryPercentages = (transactions) => (
  api.post("/trial/categories/percentages", {
    transactions: transactions
  })
);

export const postNewUser = (user) => (
  api.post("/user", {
    username: user.nickname,
    email: user.email
  })
);

export const updateUser = ({ id, updatedAttributes }) => (api.put(`/user/${id}`, updatedAttributes));
