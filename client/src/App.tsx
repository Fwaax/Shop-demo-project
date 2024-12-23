import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Header from "./components/header";
import DebugPage from "./pages/debugPage";
import HomePage from "./pages/homePage";
import RegisterPage from "./pages/registerPage";
import LoginPage from "./pages/loginPage";
import AccountEdit from "./pages/updateAccountPage";
import PostItemPage from "./pages/postItemPage";
import GenerateMoneyPage from "./pages/generateMoneyPage";
import MyItemsPage from "./pages/myItemsPage";

const queryClient = new QueryClient();

function MainLayout() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "debug", element: <DebugPage /> },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/update-account", element: <AccountEdit /> },
  { path: "/post-item", element: <PostItemPage /> },
  { path: "/generate", element: <GenerateMoneyPage /> },
  { path: "/my-items", element: <MyItemsPage /> },
  // { path: "/generate-item", element: <GenerateItemPage /> },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
