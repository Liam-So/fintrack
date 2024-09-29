import React from 'react';
import { MoveRight } from 'lucide-react';
import { useAuth0 } from "@auth0/auth0-react";
import Profile from './Profile';
import { api } from '../axios';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  const handleTrialSession = async () => {
    api.get('/generate_temp_session').then((response) => {
      if (response.data.session_id) {
        navigate(`/trial/onboard/${response.data.session_id}`);
      }
    }).catch((error) => {
      console.error('Error generating temp session:', error);
    });
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <div className="max-w-3xl w-full space-y-8">
        <h1 className="text-4xl font-bold text-center">Welcome to FinTrack</h1>
        <p className="text-lg text-center text-gray-400">
          Discover the power of our innovative solution.
        </p>
        <div className="grid grid-cols-2 gap-8">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-between"
            onClick={handleTrialSession}
          >
            <span>Try It Out</span>
            <MoveRight />
          </button>
          <button
            onClick={() => loginWithRedirect()}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-between"
          >
            <span>Login/Register</span>
            <MoveRight />
          </button>
        </div>

        {isAuthenticated && (
          <button onClick={() => logout()}>
            Log out
          </button>
        )}

        <Profile />
      </div>
    </div>
  );
};

export default LandingPage;
