import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchUserData, getUserCategories } from '../api/dashboardApi';
import { useLocation } from "react-router-dom";

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
    } else if (!isAuthenticated) {
      const isTrial = window.sessionStorage.getItem("session");
      console.log("Is trial:", isTrial);
    }
  }, [isAuthenticated, user]);

  const updateUserCategories = async (newCategories) => {
    if (isAuthenticated && user) {
      try {
        // Here you would typically send an API request to update the backend
        // await fetch(`/api/user/${user.sub}/categories`, {
        //   method: 'PUT',
        //   body: JSON.stringify({ categories: newCategories }),
        //   headers: { 'Content-Type': 'application/json' }
        // });

        // If the API call is successful, update the local state
        setAdditionalUserInfo(prevInfo => ({
          ...prevInfo,
          categories: newCategories
        }));
      } catch (error) {
        console.error('Error updating user categories:', error);
      }
    } else if (!isAuthenticated && window.sessionStorage.getItem("session")) {
      console.log("Updating categories for trial user", newCategories);
      window.sessionStorage.setItem("categories", JSON.stringify(newCategories));
    }
  };

  const updateUserIncome = async (newIncome) => {
    if (isAuthenticated && user) {
      try {
        // Here you would typically send an API request to update the backend
        // await fetch(`/api/user/${user.sub}/income`, {
        //   method: 'PUT',
        //   body: JSON.stringify({ income: newIncome }),
        //   headers: { 'Content-Type': 'application/json' }
        // });

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
    updateUserIncome
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);