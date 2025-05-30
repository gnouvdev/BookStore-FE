/* eslint-disable no-unused-vars */
"use client";

import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingCart,
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowRight,
  FaSpinner,
  FaShoppingBag,
} from "react-icons/fa";
import {
  RiDeleteBin6Line,
  RiShoppingCart2Line,
  RiHeartLine,
} from "react-icons/ri";
import {
  useGetCartQuery,
  useClearCartMutation,
  useRemoveFromCartMutation,
  useUpdateCartItemQuantityMutation,
} from "../../redux/features/cart/cartApi";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import gsap from "gsap";
import "../../styles/cart-checkout.css";

const EnhancedCartPage = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { data: cart, isLoading, isError, error } = useGetCartQuery();
  const [clearCart, { isLoading: isClearingCart }] = useClearCartMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [updateCartItemQuantity] = useUpdateCartItemQuantityMutation();

  const [removingItems, setRemovingItems] = useState(new Set());
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const cartRef = useRef(null);
  const headerRef = useRef(null);
  const itemsRef = useRef([]);

  // Enhanced animations
  useEffect(() => {
    if (cart?.data?.items?.length && cartRef.current) {
      const tl = gsap.timeline();

      tl.fromTo(
        headerRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      ).fromTo(
        itemsRef.current,
        { y: 30, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.4"
      );
    }
  }, [cart?.data?.items]);

  const handleRemoveFromCart = async (bookId, itemIndex) => {
    setRemovingItems((prev) => new Set([...prev, bookId]));

    try {
      // Animate item removal
      if (itemsRef.current[itemIndex]) {
        await gsap.to(itemsRef.current[itemIndex], {
          x: -100,
          opacity: 0,
          scale: 0.8,
          duration: 0.4,
          ease: "power2.in",
        });
      }

      const response = await removeFromCart(bookId).unwrap();

      Swal.fire({
        icon: "success",
        title: t("cart.remove_success"),
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: "top-end",
      });
    } catch (error) {
      console.error("Error removing item:", error);

      // Reset animation on error
      if (itemsRef.current[itemIndex]) {
        gsap.set(itemsRef.current[itemIndex], { x: 0, opacity: 1, scale: 1 });
      }

      Swal.fire({
        icon: "error",
        title: t("cart.error"),
        text: error?.data?.message || t("cart.remove_failed"),
      });
    } finally {
      setRemovingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    const result = await Swal.fire({
      title: t("cart.confirm_clear"),
      text: t("cart.clear_warning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("cart.yes_clear"),
      cancelButtonText: t("cart.cancel"),
      background: "#ffffff",
      customClass: {
        popup: "rounded-2xl shadow-2xl",
        confirmButton: "rounded-xl px-6 py-3",
        cancelButton: "rounded-xl px-6 py-3",
      },
    });

    if (result.isConfirmed) {
      try {
        // Animate all items out
        await gsap.to(itemsRef.current, {
          x: -100,
          opacity: 0,
          scale: 0.8,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.in",
        });

        await clearCart().unwrap();

        Swal.fire({
          icon: "success",
          title: t("cart.clear_success"),
          showConfirmButton: false,
          timer: 1500,
          toast: true,
          position: "top-end",
        });
      } catch (error) {
        console.error("Error clearing cart:", error);
        Swal.fire({
          icon: "error",
          title: t("cart.error"),
          text: error?.data?.message || t("cart.clear_failed"),
        });
      }
    }
  };

  const handleQuantityChange = async (bookId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;

    if (newQuantity < 1) {
      const itemIndex = cart.data.items.findIndex(
        (item) => item.book._id === bookId
      );
      await handleRemoveFromCart(bookId, itemIndex);
      return;
    }

    setUpdatingItems((prev) => new Set([...prev, bookId]));

    try {
      console.log(
        "Updating quantity for book:",
        bookId,
        "New quantity:",
        newQuantity
      );

      const response = await updateCartItemQuantity({
        bookId: bookId,
        quantity: newQuantity,
      }).unwrap();

      console.log("Update response:", response);

      Swal.fire({
        icon: "success",
        title: t("cart.quantity_updated", "Quantity Updated"),
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: "top-end",
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      console.error("Error details:", {
        status: error.status,
        data: error.data,
        message: error.message,
        originalError: error.originalError,
      });

      Swal.fire({
        icon: "error",
        title: t("cart.error", "Error"),
        text:
          error?.data?.message ||
          t("cart.quantity_update_failed", "Failed to update quantity"),
      });
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookId);
        return newSet;
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-xl font-semibold text-gray-700">{t("loading")}</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4"
        >
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">{t("error")}</h2>
          <p className="text-gray-600">{error.message}</p>
          <Link
            to="/"
            className="inline-block mt-4 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors duration-200"
          >
            {t("cart.back_to_shop")}
          </Link>
        </motion.div>
      </div>
    );
  }

  // Login required state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="text-6xl mb-4"
          >
            🔐
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {t("cart.please_login")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("cart.please_login")}
          </p>
          <Link
            to="/login"
            className="inline-block bg-blue-500 text-white px-8 py-3 rounded-xl hover:bg-blue-600 transition-colors duration-200 font-semibold"
          >
            {t("cart.login_now")}
          </Link>
        </motion.div>
      </div>
    );
  }

  // Empty cart state
  if (!cart?.data?.items?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-2xl p-12 shadow-2xl max-w-lg mx-4"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="text-8xl mb-6"
          >
            🛒
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {t("cart.cart_empty")}
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            {t("cart.cart_empty_description")}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg"
          >
            <FaShoppingBag />
            {t("cart.start_shopping")}
          </Link>
        </motion.div>
      </div>
    );
  }

  const cartItems = cart.data.items;
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div ref={cartRef} className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/20"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <RiShoppingCart2Line className="text-white text-2xl" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t("cart.cart")}
                </h1>
                <p className="text-gray-600 mt-1">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}{" "}
                  in your cart
                </p>
              </div>
            </div>

            <motion.button
              onClick={handleClearCart}
              disabled={isClearingCart}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isClearingCart ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <RiDeleteBin6Line />
              )}
              {isClearingCart ? "Clearing..." : t("cart.clear_cart")}
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <motion.div
              className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {t("cart.shopping_items")}
              </h2>

              <div className="space-y-6">
                <AnimatePresence>
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.book._id}
                      ref={(el) => (itemsRef.current[index] = el)}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100, scale: 0.8 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-6">
                        {/* Book Image */}
                        <motion.div
                          className="relative group"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="w-24 h-32 rounded-xl overflow-hidden shadow-lg">
                            <img
                              src={
                                item.book.coverImage ||
                                "/placeholder.svg?height=128&width=96"
                              }
                              alt={item.book.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          <motion.div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Link
                              to={`/books/${item.book._id}`}
                              className="text-white text-sm font-semibold"
                            >
                              {t("cart.view_details")}
                            </Link>
                          </motion.div>
                        </motion.div>

                        {/* Book Details */}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/books/${item.book._id}`}
                            className="block group"
                          >
                            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors duration-200">
                              {item.book.title}
                            </h3>
                          </Link>

                          <div className="flex items-center gap-4 mb-4">
                            <span className="text-2xl font-bold text-blue-600">
                              {(item.price * item.quantity).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              đ
                            </span>
                            <span className="text-gray-500">
                              {item.price.toLocaleString("vi-VN")} đ x1
                            </span>
                          </div>

                          {/* Low Stock Warning */}
                          {item.book.quantity < 10 && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm font-medium mb-4"
                            >
                              Chỉ còn lại {item.book.quantity} sản phẩm
                            </motion.div>
                          )}

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-600">
                                {t("cart.quantity")}:
                              </span>
                              <div className="flex items-center gap-2">
                                <motion.button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.book._id,
                                      item.quantity,
                                      -1
                                    )
                                  }
                                  disabled={updatingItems.has(item.book._id)}
                                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <FaMinus className="w-3 h-3 text-gray-600" />
                                </motion.button>

                                <motion.span
                                  key={item.quantity}
                                  initial={{ scale: 1.2 }}
                                  animate={{ scale: 1 }}
                                  className="w-12 text-center font-bold text-lg"
                                >
                                  {item.quantity}
                                </motion.span>

                                <motion.button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.book._id,
                                      item.quantity,
                                      1
                                    )
                                  }
                                  disabled={updatingItems.has(item.book._id)}
                                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <FaPlus className="w-3 h-3 text-gray-600" />
                                </motion.button>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <motion.button
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <RiHeartLine className="w-5 h-5" />
                              </motion.button>

                              <motion.button
                                onClick={() =>
                                  handleRemoveFromCart(item.book._id, index)
                                }
                                disabled={removingItems.has(item.book._id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 disabled:opacity-50"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {removingItems.has(item.book._id) ? (
                                  <FaSpinner className="w-5 h-5 animate-spin" />
                                ) : (
                                  <FaTrash className="w-5 h-5" />
                                )}
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20 sticky top-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {t("cart.order_summary")}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>
                    {t("cart.subtotal")} ({cartItems.length} {t("cart.items")})
                  </span>
                  <span>{totalAmount.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t("cart.shipping")}</span>
                  <span className="text-green-600 font-semibold">
                    {t("cart.free")}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t("cart.tax")}</span>
                  <span>{t("cart.calculated_at_checkout")}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>{t("cart.total")}</span>
                  <span className="text-blue-600">
                    {totalAmount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link to="/checkout" className="block w-full">
                  <motion.button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.4)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaShoppingCart />
                    {t("cart.checkout")}
                    <FaArrowRight />
                  </motion.button>
                </Link>

                <Link to="/" className="block w-full">
                  <motion.button
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t("cart.continue_shopping")}
                    <FaArrowRight />
                  </motion.button>
                </Link>
              </motion.div>

              {/* Security Badge */}
              <motion.div
                className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🔒</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      {t("cart.secure_checkout")}
                    </p>
                    <p className="text-xs text-green-600">
                      {t("cart.your_payment_information_is_protected")}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCartPage;
