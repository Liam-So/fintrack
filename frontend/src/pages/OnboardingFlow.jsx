import React, { useState } from 'react'
import MonthlyIncomeInput from '../components/MonthlyIncomeInput';
import CategorySelection from '../components/CategorySelection';
import { useNavigate, useParams } from 'react-router-dom';
import { postOnboardUser, updateUser } from '../api/dashboardApi';

const OnboardingFlow = ({ isTrial }) => {
  const [step, setStep] = useState('income');
  const [income, setIncome] = useState(null);
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();

  const handleNext = (income) => {
    setIncome(income);
    setStep('categories');
  }

  const handleComplete = async (selectedCategories) => {
    setCategories(selectedCategories);

    if (isTrial) {
      navigate(`/trial/upload/${id}`, {
        state: {
          selectedCategories,
          income
        }
      })
    } else {
      // Update user AND add categories to user_categories
      const updatedUser = await updateUser({ id, updatedAttributes: { monthly_income: income } });
      const onboardUser = await postOnboardUser({ id, selectedCategories, income });
      navigate(`/upload/${id}`, {
        state: {
          selectedCategories,
          income
        }
      })
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