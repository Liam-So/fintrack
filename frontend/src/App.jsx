import SecureFileUpload from "./pages/SecureFileUpload";
import {
  RouterProvider,
  createBrowserRouter
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import TrialDashboard from "./pages/TrialDashboard";
import OnboardingFlow from "./pages/OnboardingFlow";


const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    Component: LandingPage
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
  // TODO: Add authentication to these routes
  {
    path: "/dashboard",
    Component: Dashboard
  },
  {
    path: "/upload/:id", // We should authenticate the user before they can access this route
    Component: SecureFileUpload
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
