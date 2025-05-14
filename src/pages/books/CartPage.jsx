import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  useGetCartQuery,
  useClearCartMutation,
  useRemoveFromCartMutation,
  useUpdateCartItemQuantityMutation,

} from "../../redux/features/cart/cartApi";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const CartPage = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { data: cart, isLoading, isError, error } = useGetCartQuery();
  const [clearCart] = useClearCartMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [updateCartItemQuantity] = useUpdateCartItemQuantityMutation();

  console.log("Cart data:", cart);
  console.log("User:", user);
  console.log("Token:", localStorage.getItem("token"));

  const handleRemoveFromCart = async (bookId) => {
    console.log("Removing item with bookId:", bookId);
    try {
      const response = await removeFromCart(bookId).unwrap();
      console.log("Remove success:", response);
     
    } catch (error) {
      console.error("Error removing item:", error);
      console.error("Error details:", error?.data || error);
      Swal.fire({
        icon: "error",
        title: t("cart.error"),
        text: error?.data?.message || t("cart.remove_failed"),
      });
    }
  };

  const handleClearCart = async () => {
    console.log("Clearing cart");
    try {
      const response = await clearCart().unwrap();
      console.log("Clear cart success:", response);

    } catch (error) {
      console.error("Error clearing cart:", error);
      console.error("Error details:", error?.data || error);
      Swal.fire({
        icon: "error",
        title: t("cart.error"),
        text: error?.data?.message || t("cart.clear_failed"),
      });
    }
  };

  const handleIncreaseQuantity = async (bookId, currentQuantity) => {
    console.log("Increasing quantity for bookId:", bookId, "Current quantity:", currentQuantity);
    try {
      const response = await updateCartItemQuantity({ bookId, quantity: currentQuantity + 1 }).unwrap();
      console.log("Increase quantity success:", response);

    } catch (error) {
      console.error("Error increasing quantity:", error);
      console.error("Error details:", error?.data || error);
      Swal.fire({
        icon: "error",
        title: t("cart.error"),
        text: error?.data?.message || t("cart.quantity_update_failed"),
      });
    }
  };

  const handleDecreaseQuantity = async (bookId, currentQuantity) => {
    console.log("Decreasing quantity for bookId:", bookId, "Current quantity:", currentQuantity);
    try {
      if (currentQuantity > 1) {
        const response = await updateCartItemQuantity({ bookId, quantity: currentQuantity - 1 }).unwrap();
        console.log("Decrease quantity success:", response);

      } else {
        const response = await removeFromCart(bookId).unwrap();
        console.log("Remove item (quantity=1) success:", response);
        Swal.fire({
          icon: "success",
          title: t("cart.remove_success"),
          showConfirmButton: false,
          timer: 1000,
        });
      }
    } catch (error) {
      console.error("Error decreasing quantity:", error);
      console.error("Error details:", error?.data || error);
      Swal.fire({
        icon: "error",
        title: t("cart.error"),
        text: error?.data?.message || t("cart.quantity_update_failed"),
      });
    }
  };

  if (isLoading) return <div className="container mx-auto p-6">{t("loading")}</div>;
  if (isError) return <div className="container mx-auto p-6 text-red-600">{t("error")}: {error.message}</div>;
  if (!user) return <div className="container mx-auto p-6">{t("cart.please_login")}</div>;
  if (!cart || !cart.items.length) return <div className="container mx-auto p-6">{t("cart.cart_empty")}</div>;

  return (
    <div className="flex mt-12 h-full flex-col overflow-hidden bg-white shadow-xl">
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="flex items-start justify-between">
          <div className="text-4xl font-semibold text-gray-900">{t("cart.cart")}</div>
          <div className="ml-3 flex h-7 items-center">
            <button
              type="button"
              onClick={handleClearCart}
              className="relative -m-2 py-1 px-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200"
            >
              <span>{t("cart.clear_cart")}</span>
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="flow-root">
            <ul role="list" className="-my-6 divide-y divide-gray-200">
              {cart.items.map((item) => (
                <li key={item.bookId} className="flex py-6">
                  <div className="h-[120px] w-[79px] flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      alt={item.title}
                      src={item.coverImage || "https://via.placeholder.com/150"}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex flex-wrap justify-between text-base font-medium text-gray-900">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate w-48">
                          <Link to={`/books/${item.bookId}`}>{item.title}</Link>
                        </h3>
                        <p className="sm:ml-4">
                          {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-wrap items-end justify-between space-y-2 text-sm">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleDecreaseQuantity(item.bookId, item.quantity)}
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          -
                        </button>
                        <p className="mx-2 text-gray-900">{item.quantity}</p>
                        <button
                          onClick={() => handleIncreaseQuantity(item.bookId, item.quantity)}
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex">
                        <button
                          onClick={() => handleRemoveFromCart(item.bookId)}
                          type="button"
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          {t("cart.remove")}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <p>{t("cart.subtotal")}</p>
          <p>{cart.totalAmount.toLocaleString("vi-VN")} đ</p>
        </div>
        <p className="mt-0.5 text-sm text-gray-500">{t("cart.shipping_taxes")}</p>
        <div className="mt-6">
          <Link
            to="/checkout"
            className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            {t("cart.checkout")}
          </Link>
        </div>
        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
          <Link to="/">
            {t("cart.or")}
            <button
              type="button"
              className="font-medium text-indigo-600 hover:text-indigo-500 ml-1"
            >
              {t("cart.continue_shopping")}
              <span aria-hidden="true"> →</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;