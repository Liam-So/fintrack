import React from "react";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate
} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import LandingPage from "./pages/LandingPage";
import TrialDashboard from "./pages/TrialDashboard";
import OnboardingFlow from "./pages/OnboardingFlow";
import Profile from "./pages/Profile";
import OfficialDashboard from "./pages/OfficialDashboard";
import UploadPage from "./pages/UploadPage";

const FunLoadingPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-custom">
      <div className="text-center">
        <div className="text-8xl font-bold text-gray-700 animate-bounce">🚀</div>
        <h1 className="text-4xl font-bold text-gray-700 mt-4 animate-pulse">Loading...</h1>
        <p className="text-lg text-gray-700 mt-2 animate-bounce">Hang on, we're blasting off!</p>
      </div>
    </div>
  );
};

const Callback = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  if (isLoading) {
    return <FunLoadingPage />;
  }
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/" />;
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();
  if (isLoading) {
    return <FunLoadingPage />;
  }
  return isAuthenticated ? children : <Navigate to="/" />;
};

const ProtectedTrialRoute = ({ children }) => {
  const sessionId = window.sessionStorage.getItem("session");
  return sessionId ? children : <Navigate to="/" />;
};

// Official routes (used when VITE_DEMO_MODE is false)
const officialRoutes = [
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/callback",
    element: <Callback />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><OfficialDashboard /></ProtectedRoute>
  },
  {
    path: "/profile",
    element: <ProtectedRoute><Profile /></ProtectedRoute>
  },
  {
    path: "/onboard",
    element: <ProtectedRoute><OnboardingFlow /></ProtectedRoute>
  },
  {
    path: "/upload",
    element: <ProtectedRoute><UploadPage /></ProtectedRoute>
  },
  {
    path: "*",
    element: <p>Not Found 🤔</p>,
  },
];

// Demo routes (used when VITE_DEMO_MODE is true)
const demoRoutes = [
  {
    path: "/",
    element: <LandingPage />,  // Sharing landing page between both modes
  },
  {
    path: "/upload",
    element: <ProtectedTrialRoute><UploadPage isTrial /></ProtectedTrialRoute>,
  },
  {
    path: "/onboard",
    element: <ProtectedTrialRoute><OnboardingFlow isTrial /></ProtectedTrialRoute>,
  },
  {
    path: "/dashboard",
    element: <ProtectedTrialRoute><TrialDashboard /></ProtectedTrialRoute>,
  },
  {
    path: "*",
    element: <p>Not Found 🤔</p>,
  }
];

// Create router based on VITE_DEMO_MODE environment variable
const router = createBrowserRouter(
  import.meta.env.VITE_DEMO_MODE === 'true' ? demoRoutes : officialRoutes
);

export default function App() {
  return (
    <RouterProvider router={router} fallbackElement={<p>Initial Load...</p>} />
  );
}