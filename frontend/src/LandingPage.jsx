import React from 'react';
import { MoveRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <div className="max-w-3xl w-full space-y-8">
        <h1 className="text-4xl font-bold text-center">Welcome to FinTrack</h1>
        <p className="text-lg text-center text-gray-400">
          Discover the power of our innovative solution.
        </p>
        <div className="grid grid-cols-2 gap-8">
          <Link
            to="/upload"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-between"
          >
            <span>Try It Out</span>
            <MoveRight />
          </Link>
          <Link
            to="/login"
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-between"
          >
            <span>Login</span>
            <MoveRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
