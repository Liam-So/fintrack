import { api } from "../axios";

export const fetchTransactionDates = (id) => (api.get(`/transactions/dates/${id}`, {
  params: {
    id: id
  }
}));

export const fetchUserData = (user) => (api.get(`/user/${user.email}`));

export const fetchTransactions = async (id, date) => (
  api.get(`/transactions/${id}`, {
    params: {
      query_by_date: date
    }
  })
)

export const fetchTrialTransactions = async (transactions) => (
  api.post(`/trial/transactions/dates`, {
    transactions: transactions
  })
)

export const fetchCategoryPercentages = (id, transactions) => (
  api.post(`/user/categories/percentages/${id}`, {
    transactions: transactions
  })
);

export const postCalculateCategoryPercentages = (transactions, categories) => (
  api.post("/trial/categories/percentages", {
    transactions: transactions,
    categories: categories
  })
);

export const getUserCategories = (id) => (api.get(`/user/categories/${id}`));

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
