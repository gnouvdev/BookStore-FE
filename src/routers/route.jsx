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

import OrderPage from "../pages/books/OrderPage";
import ThanksPage from "./../pages/thanksPage/ThanksPage";
import AdminRoute from "../../../../Sample/build-full-stack-book-store-mern-app/frontend/src/routers/AdminRoute";
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
        element: <GridBooks genre={"business"} />,
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
    element: <AdminRoute><DashboardLayout/></AdminRoute>,
    children: [
      {
        path: "",
        element: (
          <AdminRoute>
            <Dashboard/>
          </AdminRoute>
        ),
      },
      {
        path: "add-new-book",
        element: (
          <AdminRoute>
            <AddBook/>
          </AdminRoute>
        ),
      },
      {
        path: "edit-book/:id",
        element: (
          <AdminRoute>
            <UpdateBook/>
          </AdminRoute>
        ),
      },
      {
        path: "manage-books",
        element: (
          <AdminRoute>
            <ManageBooks/>
          </AdminRoute>
        ),
      },
      {
        path: "manage-categories",
        element: (
          <AdminRoute>
            <ManageCategories/>
          </AdminRoute>
        ),
      },
      {
        path: "manage-authors",
        element: (
          <AdminRoute>
            <ManageAuthors/>
          </AdminRoute>
        ),
      },
      {
        path: "edit-category/:id",
        element: (
          <AdminRoute>
            <EditCategory/>
          </AdminRoute>
        ),
      },
      {
        path: "manage-users",
        element: (
          <AdminRoute>
            <ManageUsers/>
          </AdminRoute>
        ),
      },
      {
        path: "manage-orders",
        element: (
          <AdminRoute>
            <ManageOrders/>
          </AdminRoute>
        ),
      }
    ],
  },
]);

export default router;
