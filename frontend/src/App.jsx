import React from "react";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import TrialDashboard from "./pages/TrialDashboard";
import OnboardingFlow from "./pages/OnboardingFlow";
import { useAuth0 } from "@auth0/auth0-react";
import Profile from "./pages/Profile";
import OfficialDashboard from "./pages/OfficialDashboard";
import TrialFileUploaderPage from "./pages/TrialFileUploaderPage";
import OfficialFileUploader from "./pages/OfficialFileUploader";
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

// TODO: protected trial routes?
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
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/callback",
    element: <Callback />,
  },
  {
    path: "*",
    element: <p>Not Found 🤔</p>,
  },
  // Can we refactor protected routes?
  {
    path: "/dashboard",
    element: <ProtectedRoute><OfficialDashboard /></ProtectedRoute>
  },
  {
    path: "/profile",
    element: <ProtectedRoute><Profile /></ProtectedRoute>
  },
  {
    path: "/onboard/:id",
    element: <ProtectedRoute><OnboardingFlow /></ProtectedRoute>
  },
  {
    path: "/upload",
    element: <ProtectedRoute><UploadPage /></ProtectedRoute>
  },
  {
    path: "/trial/upload",
    element: <ProtectedTrialRoute><UploadPage isTrial /></ProtectedTrialRoute>,
  },
  {
    path: "/trial/onboard",
    element:  <ProtectedTrialRoute><OnboardingFlow isTrial /></ProtectedTrialRoute>,
  },
  {
    path: "/trial/dashboard",
    element: <ProtectedTrialRoute><TrialDashboard /></ProtectedTrialRoute>,
  }
]);

export default function App() {
  return (
    <RouterProvider router={router} fallbackElement={<p>Initial Load...</p>} />
  );
}
