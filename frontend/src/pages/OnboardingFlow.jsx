import React, { useState } from 'react'
import MonthlyIncomeInput from '../components/MonthlyIncomeInput';
import CategorySelection from '../components/CategorySelection';
import { useNavigate, useParams } from 'react-router-dom';
import { postOnboardUser, updateUser } from '../api/dashboardApi';
import { useUser } from '../context/UserContext';

const OnboardingFlow = ({ isTrial }) => {
  const [step, setStep] = useState('income');
  const { user, updateUserCategories, updateUserIncome } = useUser();

  const navigate = useNavigate();
  const { id } = useParams();

  const handleNext = (income) => {
    updateUserIncome(income);
    setStep('categories');
  }

  const handleComplete = async (selectedCategories) => {
    updateUserCategories(selectedCategories);
    const income = user.income;

    if (isTrial) {
      window.sessionStorage.setItem("categories", JSON.stringify(selectedCategories));
      navigate(`/trial/upload/${id}`);
    } else {
      try {
        // Update user AND add categories to user_categories
        await updateUser({ id, updatedAttributes: { monthly_income: income } });
        await postOnboardUser({ id, selectedCategories, income });
        navigate(`/upload/${id}`);
      }
      catch (error) {
        console.error('Error onboarding user:', error);
      }
    }
  }

  return (
    <>
      {step === 'income' && <MonthlyIncomeInput onNext={handleNext} />}
      {step === 'categories' && <CategorySelection onComplete={handleComplete} />}
    </>
  )
}

export default OnboardingFlow