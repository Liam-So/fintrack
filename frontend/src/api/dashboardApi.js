import { api } from "../axios";

export const fetchTransactionDates = (id) => (api.get(`/transactions/dates/${id}`, {
  params: {
    id: id
  }
}));

export const fetchUserData = (user) => (api.get(`/user/${user.email}`));

export const fetchTransactions = async (id, type, period) => (
  api.get(`/transactions/${id}`, {
    params: {
      type: type,
      period: period
    }
  })
)

export const generateCSV = (sample) => (
  api.get(`/trial/download`, {
    params: {
      sample: sample
    },
    responseType: 'blob'
  })
)

export const fetchCategoryPercentages = (id, transactions) => (
  api.post(`/user/categories/percentages/${id}`, {
    transactions: transactions
  })
);

export const postCategories = (id, categories) => (
  api.post(`/user/categories/${id}`, {
    categories: categories
  })
)

export const deleteCategory = (id, category) => (
  api.delete(`/user/categories/${id}`, { data: {
      category_id: category
    }
  })
)

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
