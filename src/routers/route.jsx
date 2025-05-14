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

import OrderPage from "../pages/books/OrderPage";
import ThanksPage from "./../pages/thanksPage/ThanksPage";
import AdminLogin from './../components/AdminLogin';
import DashboardLayout from "../pages/dashBoard/DashboardLayout";
import Dashboard from './../pages/dashBoard/Dashboard';
import AddBook from './../pages/dashBoard/addBook/AddBook';
import UpdateBook from './../pages/dashBoard/EditBook/UpdateBook';
import ManageBooks from './../pages/dashBoard/manageBooks/ManageBooks';
import SearchBook from "../pages/books/SearchBook";
import ManageCategories from './../pages/dashBoard/manageCategories/ManageCategories';
import EditCategory from './../pages/dashBoard/manageCategories/EditCategory';
import ManageAuthors from './../pages/dashBoard/manageAuthors/ManageAuthors';
import ManageUsers from './../pages/dashBoard/manageUsers/ManageUsers';
import Profile from './../pages/user/profile';
import ManageOrders from './../pages/dashBoard/manageOrders/ManageOrders';
import Recommended from "../pages/home/Recommended";
import BookRecommendations from './../components/BookRecommendations';
import WishlistPage from "../pages/wishlist/WishlistPage";



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
        element: <OrderPage />,
      },
      {
        path: "/orders/thanks",
        element: <ThanksPage />,
      },
      {
        path: "/about",
        element: <div>About</div>,
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
          path: "/wishlist",
          element: <WishlistPage />,
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
        element:<GridBooks genre={"fiction"} />,
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
        path: "/product/bussines",
        element: <GridBooks genre={"bussines"} />,
      },
      {
        path: "/product/manga",
        element: <GridBooks genre={"manga"} />,
      },
      {
        path: "/search",
        element: <SearchBook/>,
      },
      {
        path: "/profile",
        element: <Profile/>,
      }
    ],
  },
  {
    path:"/admin",
    element:<AdminLogin/>
  },
  {
    path: "/dashboard",
    element: <AdminRoute />,
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
        ],
      },
    ],
  },
]);

export default router;
