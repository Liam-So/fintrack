import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { deleteCategory, fetchUserData, getUserCategories, postCategories, updateUser } from '../api/dashboardApi';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();
  const [additionalUserInfo, setAdditionalUserInfo] = useState({
    categories: {},
    income: null
  });

  useEffect(() => {
    // Should we add user id for trial?
    if (isAuthenticated && user) {
      // Fetch additional user info from your backend
      const fetchAdditionalInfo = async () => {
        try {
          const { data: userData } = await fetchUserData(user);
          const { data: categories } = await getUserCategories(userData.id);
          
          setAdditionalUserInfo({
            id: userData.id,
            categories: categories,
            income: userData.monthly_income
          });
        } catch (error) {
          console.error('Error fetching additional user info:', error);
        }
      };

      fetchAdditionalInfo();
    } 
    // sometimes refresh clears session storage so we need to check if session exists
    else if (!isAuthenticated && window.sessionStorage.getItem("session")) {
      console.log("Setting trial session");
      
      const categories = JSON.parse(window.sessionStorage.getItem("categories"));
      const newCategoriesObj = categories.reduce((acc, item) => {
        acc[item.id] = item.name;
          return acc;
      }, {});
      const income = window.sessionStorage.getItem("income");

      setAdditionalUserInfo({
        id: window.sessionStorage.getItem("session"),
        categories: newCategoriesObj,
        income: income
      });
    }
  }, [isAuthenticated, user]);


  const setTrialSession = (sessionId) => {
    window.sessionStorage.setItem('session', sessionId);
    setAdditionalUserInfo({
      id: sessionId
    });
  }


  const deleteUserCategory = async (category) => {
    if (isAuthenticated && user) {
      try {
        const { data } = await deleteCategory(additionalUserInfo.id, category);
        setAdditionalUserInfo(prevInfo => ({
          ...prevInfo,
          categories: data.categories
        }));
      } catch (error) {
        console.error('Error deleting user category:', error);
      }
    }
  }


  const updateUserCategories = async (newCategories) => {
    if (isAuthenticated && user) {
      try {
        const { data } = await postCategories(additionalUserInfo.id, newCategories);

        // If the API call is successful, update the local state
        setAdditionalUserInfo(prevInfo => ({
          ...prevInfo,
          categories: data.categories
        }));
      } catch (error) {
        console.error('Error updating user categories:', error);
      }
    } else if (!isAuthenticated && window.sessionStorage.getItem("session")) {
      window.sessionStorage.setItem("categories", JSON.stringify(newCategories));
      const newCategoriesObj = newCategories.reduce((acc, item) => {
        acc[item.id] = item.name;
          return acc;
      }, {});

      setAdditionalUserInfo(prevInfo => ({
        ...prevInfo,
        categories: newCategoriesObj
      }));
    }
  };

  const updateUserIncome = async (newIncome) => {
    if (isAuthenticated && user) {
      try {
        await updateUser({
          id: additionalUserInfo.id,
          updatedAttributes: {
            monthly_income: newIncome
          }
        })

        // If the API call is successful, update the local state
        setAdditionalUserInfo(prevInfo => ({
          ...prevInfo,
          income: newIncome
        }));
      } catch (error) {
        console.error('Error updating user income:', error);
      }
    } else if (!isAuthenticated && window.sessionStorage.getItem("session")) {
      console.log("Updating income for trial user", newIncome);
      window.sessionStorage.setItem("income", newIncome);
    }
  };

  const value = {
    user: user ? { ...user, ...additionalUserInfo } : { ...additionalUserInfo }, // pass additional info for trial
    isAuthenticated,
    isLoading,
    logout,
    updateUserCategories,
    updateUserIncome,
    deleteUserCategory,
    setTrialSession
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);