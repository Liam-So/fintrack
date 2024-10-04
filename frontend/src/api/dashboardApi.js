import { api } from "../axios";

export const fetchUserData = (user) => (api.get(`user/${user.email}`));

export const fetchTransactions = async (id, month) => (
  api.get(`/users/${id}/transactions`, {
    params: {
      query_by_month: month
    }
  })
)

export const fetchCategoryPercentages = (id) => (api.get(`/user/${id}/categories/percentages`));

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