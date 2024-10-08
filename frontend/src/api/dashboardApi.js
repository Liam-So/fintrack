import { api } from "../axios";

export const fetchUserData = (user) => (api.get(`user/${user.email}`));

export const fetchTransactions = async (id, month) => (
  api.get(`/users/${id}/transactions`, {
    params: {
      query_by_month: month
    }
  })
)

export const fetchTrialTransactions = async (transactions, month) => (
  api.post(`/trial/transactions`, {
    transactions: transactions,
    month: month
  })
);

export const fetchCategoryPercentages = (id, transactions) => (
  api.post(`/user/${id}/categories/percentages`, {
    transactions: transactions
  })
);

export const postCalculateCategoryPercentages = (transactions) => (
  api.post("/trial/categories/percentages", {
    transactions: transactions
  })
);

export const getUserCategories = (id) => (api.get(`/users/${id}/categories`));

export const postNewUser = (user) => (
  api.post("/user", {
    username: user.nickname,
    email: user.email
  })
);

export const updateUser = ({ id, updatedAttributes }) => (api.put(`/user/${id}`, updatedAttributes));

export const postOnboardUser = ({ id, selectedCategories, income }) => (
  api.post(`/onboard/${id}`, {
    categories: selectedCategories,
    monthly_income: income
  })
);

export const postTransactions = (transactions, id) => (
  api.post(`/transactions/${id}`, {
    transactions: transactions
  })
);

export const deleteTransaction = (id) => (api.delete(`/transactions/${id}`));

export const updateTransaction = (id, updatedAttributes) => (api.put(`/transactions/${id}`, updatedAttributes));
