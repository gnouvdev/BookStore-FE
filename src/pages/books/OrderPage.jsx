/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaBox,
  FaSearch,
  FaFilter,
  FaEye,
  FaStar,
  FaShoppingCart,
  FaTruck,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import { RiShoppingBag3Line } from "react-icons/ri";
import {
  useGetOrdersQuery,
  useCancelOrderMutation,
} from "../../redux/features/orders/ordersApi";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import Swal from "sweetalert2";
import { FaBan } from "react-icons/fa";

const EnhancedOrderPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const headerRef = useRef(null);
  const filtersRef = useRef(null);
  const ordersRef = useRef([]);

  const { data, isLoading, isError, error } = useGetOrdersQuery(
    currentUser?.email,
    {
      skip: !currentUser?.email,
    }
  );
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  // Sắp xếp đơn hàng mới nhất lên trên (tạo copy để tránh lỗi read-only)
  const orders = [...(data?.data || [])].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.updatedAt || 0);
    const dateB = new Date(b.createdAt || b.updatedAt || 0);
    return dateB - dateA; // Mới nhất lên trên
  });

  // Enhanced animations
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }

    if (filtersRef.current) {
      gsap.fromTo(
        filtersRef.current.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.3,
        }
      );
    }
  }, []);

  useEffect(() => {
    ordersRef.current.forEach((order, index) => {
      if (order) {
        gsap.fromTo(
          order,
          { y: 50, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: index * 0.1,
            ease: "power2.out",
          }
        );
      }
    });
  }, [orders, filter, searchQuery]);

  // Filter and search orders
  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && order.status === "pending") ||
      (filter === "shipped" && order.status === "shipped") ||
      (filter === "delivered" && order.status === "delivered") ||
      (filter === "completed" && order.status === "completed");

    if (!searchQuery) return matchesFilter;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      order._id.toLowerCase().includes(searchLower) ||
      order.productIds.some((product) =>
        product.productId?.title?.toLowerCase().includes(searchLower)
      );

    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock className="text-orange-500" />;
      case "shipped":
        return <FaTruck className="text-blue-500" />;
      case "delivered":
        return <FaBox className="text-green-500" />;
      case "completed":
        return <FaCheckCircle className="text-purple-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filters = [
    { key: "all", label: "All Orders", icon: FaBox, count: orders.length },
    {
      key: "pending",
      label: "Pending",
      icon: FaClock,
      count: orders.filter((o) => o.status === "pending").length,
    },
    {
      key: "shipped",
      label: "Shipped",
      icon: FaTruck,
      count: orders.filter((o) => o.status === "shipped").length,
    },
    {
      key: "delivered",
      label: "Delivered",
      icon: FaBox,
      count: orders.filter((o) => o.status === "delivered").length,
    },
    {
      key: "completed",
      label: "Completed",
      icon: FaCheckCircle,
      count: orders.filter((o) => o.status === "completed").length,
    },
  ];

  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleCancelOrder = async (orderId, e) => {
    e.stopPropagation(); // Prevent triggering order click

    const result = await Swal.fire({
      title: "Xác nhận hủy đơn hàng",
      text: "Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Có, hủy đơn hàng",
      cancelButtonText: "Không",
    });

    if (result.isConfirmed) {
      try {
        await cancelOrder(orderId).unwrap();
        toast.success("Đơn hàng đã được hủy thành công");
      } catch (error) {
        toast.error(
          error?.data?.message || "Không thể hủy đơn hàng. Vui lòng thử lại."
        );
      }
    }
  };

  // Handle unauthenticated users
  if (!currentUser || !currentUser.email) {
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
            {t("order.login_required")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("order.you_need_to_login_to_view_your_orders")}
          </p>
          <motion.button
            onClick={() => navigate("/login")}
            className="bg-blue-500 text-white px-8 py-3 rounded-xl hover:bg-blue-600 transition-colors duration-200 font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t("order.go_to_login")}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Handle loading state
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
          <p className="text-xl font-semibold text-gray-700">
            {t("order.loading_your_orders")}
          </p>
        </motion.div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    const errorMessage = error?.data?.message || "Error loading orders";

    if (error?.status === 401) {
      toast.error(t("order.session_expired"));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      return null;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4"
        >
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            {t("order.error_loading_orders")}
          </h2>
          <p className="text-gray-600">{errorMessage}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background */}
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
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
                <RiShoppingBag3Line className="text-white text-2xl" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t("order.my_orders")}
                </h1>
                <p className="text-gray-600 mt-1">
                  {t("order.track_and_manage_your_orders")}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-sm text-gray-600">
                  {t("order.total_orders")}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.length}
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-sm text-gray-600">{t("order.completed")}</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter((o) => o.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          ref={filtersRef}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 mb-8 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {t("order.filter_and_search")}
            </h2>
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaFilter />
              {showFilters ? t("order.hide_filters") : t("order.show_filters")}
            </motion.button>
          </div>

          <div
            className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            {/* Status Filters */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t("order.order_status")}
              </label>
              <div className="flex flex-wrap gap-3">
                {filters.map((f) => (
                  <motion.button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      filter === f.key
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <f.icon />
                    {f.label}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        filter === f.key ? "bg-white/20" : "bg-gray-200"
                      }`}
                    >
                      {f.count}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("order.search_orders")}
              </label>
              <div className="relative max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("order.search_by_order_id_or_product_name")}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        <AnimatePresence>
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="text-8xl mb-6"
              >
                📦
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {t("order.no_orders_found")}
              </h3>
              <p className="text-gray-600 mb-6">
                {orders.length === 0
                  ? t("order.you_haven_t_placed_any_orders_yet")
                  : t("order.no_orders_match_your_search_criteria")}
              </p>
              <motion.button
                onClick={() => navigate("/")}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("orders.start_shopping")}
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  ref={(el) => (ordersRef.current[index] = el)}
                  className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden cursor-pointer"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleOrderClick(order._id)}
                >
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-colors duration-200">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors duration-200">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200">
                            Order #{order._id.slice(-8)}
                          </h3>
                          <p className="text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                            order.status
                          )} hover:shadow-md transition-all duration-200`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status?.charAt(0).toUpperCase() +
                            order.status?.slice(1)}
                        </span>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(
                              selectedOrder === order._id ? null : order._id
                            );
                          }}
                          className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaEye />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-6">
                    {/* Products Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {order.productIds?.slice(0, 3).map((item) => {
                        const product = item.productId || item;
                        const quantity = item.quantity || 1;

                        return (
                          <motion.div
                            key={product._id || Math.random()}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/books/${product._id}`);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <img
                              src={
                                product.coverImage ||
                                "/placeholder.svg?height=60&width=45"
                              }
                              alt={product.title || "Product"}
                              className="w-12 h-16 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 truncate hover:text-blue-600 transition-colors duration-200">
                                {product.title || "Unknown Product"}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Qty: {quantity}
                              </p>
                              <p className="text-sm font-semibold text-blue-600">
                                {(
                                  (product.price?.newPrice ||
                                    product.price ||
                                    0) * quantity
                                ).toLocaleString("vi-VN")}
                                đ
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}

                      {order.productIds?.length > 3 && (
                        <div className="flex items-center justify-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                          <p className="text-gray-600 font-medium">
                            +{order.productIds.length - 3}{" "}
                            {t("order.more_items")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Order Summary */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-6">
                        <div className="hover:text-blue-600 transition-colors duration-200">
                          <p className="text-sm text-gray-600">
                            {t("order.total_items")}
                          </p>
                          <p className="font-semibold text-gray-800">
                            {order.productIds?.length || 0}
                          </p>
                        </div>
                        <div className="hover:text-blue-600 transition-colors duration-200">
                          <p className="text-sm text-gray-600">
                            {t("order.order_date")}
                          </p>
                          <p className="font-semibold text-gray-800">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right hover:text-blue-600 transition-colors duration-200">
                        <p className="text-sm text-gray-600">
                          {t("order.total_amount")}
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {order.totalPrice?.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 mt-6">
                      {order.status === "pending" && (
                        <motion.button
                          onClick={(e) => handleCancelOrder(order._id, e)}
                          disabled={isCancelling}
                          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaBan />
                          {isCancelling
                            ? t("order.cancelling")
                            : t("order.cancel_order")}
                        </motion.button>
                      )}

                      {order.status === "completed" && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/books/${order.productIds[0].productId._id}`,
                              {
                                state: {
                                  orderId: order._id,
                                  orderStatus: order.status,
                                  productId: order.productIds[0].productId._id,
                                },
                              }
                            );
                          }}
                          className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition-colors duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaStar />
                          {t("order.write_review")}
                        </motion.button>
                      )}

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/books/${order.productIds[0].productId._id}`
                          );
                        }}
                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaShoppingCart />
                        {t("order.buy_again")}
                      </motion.button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {selectedOrder === order._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200 bg-gray-50"
                      >
                        <div className="p-6">
                          <h4 className="text-lg font-bold text-gray-800 mb-4">
                            {t("order.order_details")}
                          </h4>
                          <div className="space-y-3">
                            {order.productIds?.map((item) => {
                              const product = item.productId || item;
                              const quantity = item.quantity || 1;

                              return (
                                <div
                                  key={product._id || Math.random()}
                                  className="flex items-center justify-between p-3 bg-white rounded-xl"
                                >
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={
                                        product.coverImage ||
                                        "/placeholder.svg?height=50&width=38"
                                      }
                                      alt={product.title || "Product"}
                                      className="w-10 h-12 object-cover rounded"
                                    />
                                    <div>
                                      <h5 className="font-semibold text-gray-800">
                                        {product.title || "Unknown Product"}
                                      </h5>
                                      <p className="text-sm text-gray-600">
                                        {t("order.quantity")}: {quantity}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="font-semibold text-gray-800">
                                    {(
                                      (product.price?.newPrice ||
                                        product.price ||
                                        0) * quantity
                                    ).toLocaleString("vi-VN")}
                                    đ
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedOrderPage;
