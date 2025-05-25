/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  FaArrowLeft,
  FaBox,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCreditCard,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch order details");
        }
        setOrder(data.data);
      } catch (err) {
        setError(err.message);
        toast.error("Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaSpinner className="animate-spin" />;
      case "processing":
        return <FaBox />;
      case "shipped":
        return <FaTruck />;
      case "delivered":
        return <FaCheckCircle />;
      case "cancelled":
        return <FaTimesCircle />;
      default:
        return <FaBox />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("orders.error_loading")}
            </h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaArrowLeft className="mr-2" />
              {t("common.go_back")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaArrowLeft className="mr-2" />
              {t("common.go_back")}
            </button>
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                <span className="flex items-center">
                  {getStatusIcon(order.status)}
                  <span className="ml-2">
                    {t(`orders.status.${order.status}`)}
                  </span>
                </span>
              </span>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                {t("orders.order_details")} #{order._id}
              </h2>
              <p className="text-sm text-gray-500">
                {format(new Date(order.createdAt), "HH:mm - dd/MM/yyyy", {
                  locale: vi,
                })}
              </p>
            </div>

            {/* Customer Info */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                {t("orders.customer_info")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <FaUser className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("orders.customer_name")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FaPhone className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.phone}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("orders.phone_number")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FaEnvelope className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.email}
                    </p>
                    <p className="text-sm text-gray-500">{t("orders.email")}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="text-gray-400 mt-1" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {typeof order.address === "object" ? (
                        <>
                          {order.address.street && (
                            <div>{order.address.street}</div>
                          )}
                          <div>
                            {order.address.city && `${order.address.city}, `}
                            {order.address.state && `${order.address.state} `}
                            {order.address.zipcode && order.address.zipcode}
                          </div>
                          {order.address.country && (
                            <div>{order.address.country}</div>
                          )}
                        </>
                      ) : (
                        order.address
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {t("orders.shipping_address")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                {t("orders.items")}
              </h3>
              <div className="space-y-4">
                {order.productIds.map((item) => {
                  // Get product data
                  const product = item.productId || {};

                  // Get price from the book model structure
                  let price = 0;
                  if (product.price) {
                    // Use newPrice if available, otherwise fallback to oldPrice
                    price =
                      product.price.newPrice || product.price.oldPrice || 0;
                  }
                  console.log("Product price:", {
                    productPrice: product.price,
                    finalPrice: price,
                  });

                  // Get quantity
                  const quantity = item.quantity || 1;
                  console.log("Quantity:", quantity);

                  // Calculate total
                  const total = price * quantity;
                  console.log("Total:", total);

                  return (
                    <div
                      key={item._id || product._id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={product.coverImage || "/placeholder.svg"}
                        alt={product.title || "Product"}
                        className="w-20 h-20 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder.svg";
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {product.title || "Unknown Product"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {t("orders.quantity")}: {quantity}
                        </p>
                        <p className="text-sm text-gray-900">
                          {price.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {total.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="px-6 py-4">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                {t("orders.summary")}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    {t("orders.subtotal")}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {order.totalPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    {t("orders.payment_method")}
                  </span>
                  <span className="text-sm font-medium text-gray-900 flex items-center">
                    <FaCreditCard className="mr-2" />
                    {order.paymentMethod.name}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">
                      {t("orders.total")}
                    </span>
                    <span className="text-base font-medium text-gray-900">
                      {order.totalPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetails;
