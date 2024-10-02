import React, { useState } from 'react'
import MonthlyIncomeInput from '../components/MonthlyIncomeInput';
import CategorySelection from '../components/CategorySelection';
import { useNavigate, useParams } from 'react-router-dom';
import { updateUser } from '../api/dashboardApi';

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
      const updatedUser = await updateUser({ id, updatedAttributes: { monthly_income: income } });
      navigate(`/upload/${id}`)
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