import React, { useState } from 'react'
import MonthlyIncomeInput from '../components/MonthlyIncomeInput';
import SampleCategory from '../pages/SampleCategory';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const OnboardingFlow = ({ isTrial }) => {
  const [step, setStep] = useState('income');
  const { updateUserCategories, updateUserIncome } = useUser();

  const navigate = useNavigate();
  const { id } = useParams();

  const handleNext = (income) => {
    updateUserIncome(income);
    setStep('categories');
  }

  const handleComplete = async (selectedCategories) => {
    updateUserCategories(selectedCategories);
    isTrial ? navigate(`/trial/upload/${id}`) : navigate(`/upload/${id}`);
  }

  return (
    <div className='bg-custom'>
      {step === 'income' && <MonthlyIncomeInput onNext={handleNext} />}
      {step === 'categories' && <SampleCategory onSend={handleComplete} />}
    </div >
  )
}

export default OnboardingFlow