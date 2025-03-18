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
        path: "/order",
        element: <div>Orders</div>,
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
        element: <Checkout />,
      },
      {
        path: "/books/:id",
        element: <SingleBook />,
      },
      {
        path: "/product",
        element: <GridBooks genre={"full"}/>,
      },
      {
        path: "/product/fiction",
        element: <GridBooks genre={"fiction"}/>,
      },
      {
        path: "/product/horror",
        element: <GridBooks genre={"horror"}/>,
      },
      {
        path: "/product/adventure",
        element: <GridBooks genre={"adventure"}/>,
      },
      {
        path: "/product/business",
        element: <GridBooks genre={"business"}/>,
      },
    ],
  },
]);

export default router;
