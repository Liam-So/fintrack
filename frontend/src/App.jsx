import SecureFileUpload from "./SecureFileUpload";
import {
  RouterProvider,
  createBrowserRouter
} from "react-router-dom";
import LandingPage from "./LandingPage";


const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    Component: LandingPage
  },
  {
    path: "/upload",
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
