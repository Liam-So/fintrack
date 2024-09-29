import SecureFileUpload from "./pages/SecureFileUpload";
import {
  RouterProvider,
  createBrowserRouter
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";


const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    Component: LandingPage
  },
  {
    path: "/upload/:id",
    Component: SecureFileUpload
  },
  {
    path: "/dashboard",
    Component: Dashboard
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
