import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { api } from '../axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const LandingPage = () => {
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const { setTrialSession } = useUser();

  const handleTrialSession = async () => {
    api.get('/trial/session').then((response) => {
      if (response.data.session_id) {
        window.sessionStorage.setItem('session', response.data.session_id);
        setTrialSession(response.data.session_id);
        navigate(`/onboard`);
      }
    }).catch((error) => {
      console.error('Error generating temp session:', error);
    });
  }

  return (
    <div className="bg-custom text-gray-800 min-h-screen flex items-center justify-center">
      <div className="max-w-3xl w-full space-y-8">
        <h1 className="text-5xl font-bold text-center">Welcome to FinTrack 💸</h1>
        <p className="text-lg text-center text-gray-500">
          FinTrack is a simple application that allows you to track your financial data and analyze your spending habits.
          We leverage AI to categorize your transactions and provide insights into your spending.
        </p>
        <div className="flex justify-center gap-6">
          <button
            className="w-44 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-3xl flex items-center justify-center"
            onClick={handleTrialSession}
          >
            <span>Try It Out</span>
          </button>
          <button
            onClick={() => loginWithRedirect()}
            className="w-44 bg-custom hover:bg-gray-50 outline outline-1 outline-gray-300 text-gray-600 font-bold py-3 px-6 rounded-3xl flex items-center justify-center"
          >
            <span>Login/Register</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
