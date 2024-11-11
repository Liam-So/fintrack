import React from "react";
import SecureFileUpload from "./pages/SecureFileUpload";
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

const Callback = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/" />;
};

// TODO: protected trial routes?
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

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
    path: "/upload/:id",
    element: <ProtectedRoute><SecureFileUpload /></ProtectedRoute>
  },
  {
    path: "/trial/upload/:id",
    element: <TrialFileUploaderPage />,
  },
  {
    path: "/trial/onboard/:id",
    element: <OnboardingFlow isTrial />,
  },
  {
    path: "/trial/dashboard/:id",
    element: <TrialDashboard />,
  }
]);

export default function App() {
  return (
    <RouterProvider router={router} fallbackElement={<p>Initial Load...</p>} />
  );
}
