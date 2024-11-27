import React from 'react';
import { CreditCard, Sparkles, ArrowRight, Github, ChartNoAxesCombined } from 'lucide-react';
import { useAuth0 } from "@auth0/auth0-react";
import { api } from '../axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import LandingPageImage from '/LandingPage.png';

const LandingPage = () => {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

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
    <div className="min-h-screen bg-custom">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="ml-2 text-xl font-bold text-gray-800">FinTrack</span>
          </div>
          <div className="flex items-center space-x-6">
            {!isDemoMode && (
              <p className='font-semibold cursor-pointer hover:text-gray-500' onClick={loginWithRedirect}>
                Login
              </p>
            )}
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600"
            >
              <Github className="h-6 w-6" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-700 leading-tight">
              Smart Expense Tracking Powered by AI
            </h1>
            <p className="mt-6 px-1 text-xl text-gray-600">
              Automatically categorize your expenses and gain insights into your spending patterns with our advanced AI technology.
            </p>
            <div className="mt-8 flex space-x-4">
              {isDemoMode ? (
                <>
                  <button onClick={handleTrialSession} className="bg-gray-800 text-white px-8 py-3 hover:bg-gray-600 transition-colors flex items-cente rounded-3xl font-semibold">
                    Try It Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-8 py-3 hover:bg-gray-50 transition-colors rounded-3xl font-semibold">
                    Watch Demo
                  </button>
                </>
              ) : (
                <button 
                  className="bg-gray-800 text-white px-8 py-3 hover:bg-blue-700 transition-colors flex items-cente rounded-3xl font-semibold"
                  onClick={loginWithRedirect}
                  >
                  Register
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0">
            <img src={LandingPageImage} width={600} height={400} alt="FinTrack Dashboard" className="rounded-lg shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-custom py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl text-center text-gray-700 mb-8">
            Why Choose FinTrack?
          </h2>
          <p className='text-xl text-gray-500 text-center mb-12'>Simplify your budgeting needs.</p>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="bg-yellow-100 p-4 rounded-full">
                <Sparkles className="h-8 w-8 text-yellow-700" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">AI-Powered Categorization</h3>
              <p className="mt-2 text-gray-600">
                Leverage AI to automatically categorize your transactions with high accuracy.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 p-4 rounded-full">
                <ChartNoAxesCombined className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Insightful Analytics</h3>
              <p className="mt-2 text-gray-600">
                Visualize your spending patterns with beautiful, interactive charts.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-4 rounded-full">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">CSV Import</h3>
              <p className="mt-2 text-gray-600">
                Easily import your transactions from any bank using CSV files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-custom text-gray-700 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <span className="ml-2 text-lg font-bold">FinTrack</span>
            </div>
            <div className="mt-4 md:mt-0">
              <p>
                &copy; 2024 FinTrack. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-6">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600"
            >
              <Github className="h-6 w-6" />
            </a>
          </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;