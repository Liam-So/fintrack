import React, { useState } from 'react'
import MonthlyIncomeInput from '../components/MonthlyIncomeInput';
import CategorySelection from '../pages/CategorySelection';
import { useUser } from '../context/UserContext';
import TrialFileUploaderPage from './TrialFileUploaderPage';
import OfficialFileUploader from './OfficialFileUploader';

const OnboardingFlow = ({ isTrial }) => {
  const [step, setStep] = useState('income');
  const { updateUserCategories, updateUserIncome } = useUser();

  const handleNext = (income) => {
    updateUserIncome(income);
    setStep('categories');
  }

  const handleComplete = async (selectedCategories) => {
    updateUserCategories(selectedCategories);
    setStep('upload')
  }

  return (
    <div className='bg-custom'>
      {step === 'income' && <MonthlyIncomeInput onNext={handleNext} />}
      {step === 'categories' && <CategorySelection isTrial={isTrial} onSend={handleComplete} />}
      {step === 'upload' && (
        isTrial ? (
          <TrialFileUploaderPage />
        ) : (
          <OfficialFileUploader />
        )
      )}
    </div >
  )
}

export default OnboardingFlow