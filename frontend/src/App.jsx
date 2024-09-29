import SecureFileUpload from "./pages/SecureFileUpload";
import {
  RouterProvider,
  createBrowserRouter
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import TrialDashboard from "./pages/TrialDashboard";


const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    Component: LandingPage
  },
  {
    path: "/upload/:id", // We should authenticate the user before they can access this route
    Component: SecureFileUpload
  },
  {
    path: "/dashboard",
    Component: Dashboard
  },
  {
    path: "/trialDashboard/:id",
    Component: TrialDashboard
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
