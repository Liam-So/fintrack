import React, { useEffect } from "react";
import SecureFileUpload from "./pages/SecureFileUpload";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import TrialDashboard from "./pages/TrialDashboard";
import OnboardingFlow from "./pages/OnboardingFlow";
import { useAuth0 } from "@auth0/auth0-react";

const Callback = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/" />;
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    Component: LandingPage,
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/onboard/:id', element: <OnboardingFlow /> },
      { path: '/upload/:id', element: <SecureFileUpload /> },
      { path: '/dashboard/:id', element: <Dashboard /> }
    ]
  },
  {
    path: "/trial/upload/:id",
    element: <SecureFileUpload isTrial />
  },
  {
    path: "/trial/onboard/:id",
    element: <OnboardingFlow isTrial />
  },
  {
    path: "/trial/dashboard/:id",
    Component: TrialDashboard
  },
  {
    path: "/dashboard",
    element: <div>Welcome Home 🏡</div> 
  },
  {
    path: "/callback",
    element: <Callback />
  },
  {
    path: "*",
    Component: () => <p>Not Found 🤔</p>
  }
]);

export default function App() {
  return (
    <RouterProvider router={router} fallbackElement={<p>Initial Load...</p>} />
  )
}
