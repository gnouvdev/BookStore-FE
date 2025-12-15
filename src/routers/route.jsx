import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";
import Login from "../components/Login";
import Register from "../components/Register";
import CartPage from "../pages/books/CartPage";
import Checkout from "../pages/books/Checkout";
import SingleBook from "../pages/books/SingleBook";
import GenreBooks from "../components/GenreBooks";
import GridBooks from "../components/GridBooks";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import { AuthProvider } from "../context/AuthContext";

import OrderPage from "../pages/books/OrderPage";
import ThanksPage from "./../pages/thanksPage/ThanksPage";
import AdminLogin from "./../components/AdminLogin";
import DashboardLayout from "../pages/dashBoard/DashboardLayout";
import Dashboard from "./../pages/dashBoard/Dashboard";
import AddBook from "./../pages/dashBoard/addBook/AddBook";
import UpdateBook from "./../pages/dashBoard/EditBook/UpdateBook";
import ManageBooks from "./../pages/dashBoard/manageBooks/ManageBooks";
import SearchBook from "../pages/books/SearchBook";
import ManageCategories from "./../pages/dashBoard/manageCategories/ManageCategories";
import EditCategory from "./../pages/dashBoard/manageCategories/EditCategory";
import ManageAuthors from "./../pages/dashBoard/manageAuthors/ManageAuthors";
import ManageUsers from "./../pages/dashBoard/manageUsers/ManageUsers";
import Profile from "./../pages/user/profile";
import ManageOrders from "./../pages/dashBoard/manageOrders/ManageOrders";
import WishlistPage from "../pages/wishlist/WishlistPage";
import VNPayCallback from "./../pages/vnpaycallback/VNPayCallback";
import PaymentSuccess from "./../pages/payment/PaymentSuccess";
import PaymentFailed from "./../pages/payment/PaymentFailed";
import ForgotPassword from "./../components/ForgotPassword";
import HomePage from "./../pages/home/HomePage";
import AboutUs from "./../pages/home/AboutUs";
import Notifications from "./../pages/notifications/Notifications";

import Chat from "../pages/dashBoard/chat/Chat";
import ManageVoucher from "./../pages/dashBoard/manageVoucher/ManageVoucher";
import ContactPage from "./../pages/home/Contact";
import OrderDetails from "./../pages/orders/OrderDetails";
import TermPolicy from "./../pages/home/TermPolicy";

const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "/orders",
        element: (
          <PrivateRoute>
            <OrderPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/orders/thanks",
        element: (
          <PrivateRoute>
            <ThanksPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/vnpay/callback",
        element: <VNPayCallback />,
      },
      {
        path: "/payment/success",
        element: (
          <PrivateRoute>
            <PaymentSuccess />
          </PrivateRoute>
        ),
      },
      {
        path: "/payment/failed",
        element: <PaymentFailed />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/home",
        element: <HomePage />,
      },
      {
        path: "/orders/:id",
        element: (
          <PrivateRoute>
            <OrderDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "/wishlist",
        element: (
          <PrivateRoute>
            <WishlistPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/checkout",
        element: (
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        ),
      },
      {
        path: "/books/:id",
        element: <SingleBook />,
      },
      {
        path: "/product",
        element: <GridBooks genre={"full"} />,
      },
      {
        path: "/product/fiction",
        element: <GridBooks genre={"fiction"} />,
      },
      {
        path: "/product/horror",
        element: <GridBooks genre={"horror"} />,
      },
      {
        path: "/product/adventure",
        element: <GridBooks genre={"adventure"} />,
      },
      {
        path: "/product/business",
        element: <GridBooks genre={"bussines"} />,
      },
      {
        path: "/product/manga",
        element: <GridBooks genre={"manga"} />,
      },
      {
        path: "/search",
        element: <SearchBook />,
      },
      {
        path: "/about",
        element: <AboutUs />,
      },
      {
        path: "/contact",
        element: <ContactPage />,
      },
      {
        path: "/term-policy",
        element: <TermPolicy />,
      },
      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "/notifications",
        element: (
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        ),
      },
      {
        path: "/reset-password",
        element: <ForgotPassword />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AuthProvider>
        <AdminLogin />
      </AuthProvider>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <AuthProvider>
        <AdminRoute />
      </AuthProvider>
    ),
    children: [
      {
        path: "",
        element: <DashboardLayout />,
        children: [
          {
            path: "",
            element: <Dashboard />,
          },
          {
            path: "add-new-book",
            element: <AddBook />,
          },
          {
            path: "edit-book/:id",
            element: <UpdateBook />,
          },
          {
            path: "manage-books",
            element: <ManageBooks />,
          },
          {
            path: "manage-categories",
            element: <ManageCategories />,
          },
          {
            path: "manage-authors",
            element: <ManageAuthors />,
          },
          {
            path: "edit-category/:id",
            element: <EditCategory />,
          },
          {
            path: "manage-users",
            element: <ManageUsers />,
          },
          {
            path: "manage-orders",
            element: <ManageOrders />,
          },
          {
            path: "chat",
            element: <Chat />,
          },
          {
            path: "manage-voucher",
            element: <ManageVoucher />,
          },
        ],
      },
    ],
  },
]);

export default router;
