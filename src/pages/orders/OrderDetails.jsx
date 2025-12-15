"use client";

/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowLeft,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Hash,
  ShoppingBag,
  Ban,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import { t } from "i18next";
import { useCancelOrderMutation } from "../../redux/features/orders/ordersApi";
import Swal from "sweetalert2";

const getStatusConfig = (status) => {
  switch (status) {
    case "pending":
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock className="w-4 h-4" />,
        label: t("orders.pending"),
        bgGradient: "from-yellow-50 to-yellow-100",
      };
    case "processing":
      return {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Package className="w-4 h-4" />,
        label: t("orders.processing"),
        bgGradient: "from-blue-50 to-blue-100",
      };
    case "shipped":
      return {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: <Truck className="w-4 h-4" />,
        label: t("orders.shipped"),
        bgGradient: "from-purple-50 to-purple-100",
      };
    case "delivered":
      return {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="w-4 h-4" />,
        label: t("orders.delivered"),
        bgGradient: "from-green-50 to-green-100",
      };
    case "cancelled":
      return {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <XCircle className="w-4 h-4" />,
        label: t("orders.cancelled"),
        bgGradient: "from-red-50 to-red-100",
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <Package className="w-4 h-4" />,
        label: t("orders.unknown"),
        bgGradient: "from-gray-50 to-gray-100",
      };
  }
};

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch order details");
        }
        console.log("Order data:", data.data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
              >
                <div className="animate-pulse p-6 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("orders.error_loading")}
            </h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-blue-500 to-blue-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.go_back")}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const statusConfig = getStatusConfig(order.status);

  // Calculate total price from products
  const calculateTotalPrice = () => {
    return order.productIds.reduce((total, item) => {
      const product = item.productId || {};
      let price = 0;
      if (product.price) {
        price = product.price.newPrice || product.price.oldPrice || 0;
      }
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);
  };

  const originalTotalPrice = calculateTotalPrice();

  const handleCancelOrder = async () => {
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
        await cancelOrder(id).unwrap();
        toast.success("Đơn hàng đã được hủy thành công");
        // Reload order details
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setOrder(data.data);
        }
      } catch (error) {
        toast.error(
          error?.data?.message || "Không thể hủy đơn hàng. Vui lòng thử lại."
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="rounded-full bg-white/70 border-gray-200/50 hover:bg-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("common.go_back")}
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t("orders.order_details")}
                  </h1>
                  <p className="text-gray-500 flex items-center mt-1">
                    <Hash className="w-4 h-4 mr-1" />
                    {order._id}
                  </p>
                </div>
              </div>

              <Badge
                className={`px-4 py-2 rounded-full border-2 ${statusConfig.color}`}
              >
                <span className="flex items-center space-x-2">
                  {statusConfig.icon}
                  <span className="font-medium">{statusConfig.label}</span>
                </span>
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-gray-200/50">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ShoppingBag className="w-5 h-5 mr-2 text-blue-500" />
                    {t("orders.items")}
                  </h2>
                </div>
                <ScrollArea className="max-h-96">
                  <div className="p-6 space-y-4">
                    {order.productIds.map((item) => {
                      const product = item.productId || {};
                      let price = 0;
                      if (product.price) {
                        price =
                          product.price.newPrice || product.price.oldPrice || 0;
                      }
                      const quantity = item.quantity || 1;
                      const total = price * quantity;

                      return (
                        <motion.div
                          key={item._id || product._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-200"
                        >
                          <div className="relative">
                            <img
                              src={product.coverImage || "/placeholder.svg"}
                              alt={product.title || "Product"}
                              className="w-16 h-16 object-cover rounded-lg shadow-sm"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder.svg";
                              }}
                            />
                            <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                              {quantity}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {product.title || t("orders.unknown_product")}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-blue-600">
                                {price.toLocaleString("vi-VN")}đ
                              </span>
                              {product.price?.oldPrice &&
                                product.price.oldPrice > price && (
                                  <span className="text-sm text-gray-400 line-through">
                                    {product.price.oldPrice.toLocaleString(
                                      "vi-VN"
                                    )}
                                    đ
                                  </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {t("orders.quantity")}: {quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {total.toLocaleString("vi-VN")}đ
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Customer Information */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-gray-200/50">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-500" />
                    {t("orders.customer_info")}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {t("orders.customer_name")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.phone}
                          </p>
                          <p className="text-sm text-gray-500">
                            {t("orders.phone_number")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {t("orders.email")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {typeof order.address === "object" ? (
                              <>
                                {order.address.street && (
                                  <div>{order.address.street}</div>
                                )}
                                <div>
                                  {order.address.city &&
                                    `${order.address.city}, `}
                                  {order.address.state &&
                                    `${order.address.state} `}
                                  {order.address.zipcode &&
                                    order.address.zipcode}
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
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-gray-200/50">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t("orders.summary")}
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {t("orders.subtotal")}
                    </span>
                    <span className="font-medium">
                      {originalTotalPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  {order.paymentDetails?.paymentAmount &&
                    order.paymentDetails.paymentAmount < originalTotalPrice && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          {t("orders.discount")}
                        </span>
                        <span className="font-medium text-green-600">
                          -
                          {(
                            originalTotalPrice -
                            order.paymentDetails.paymentAmount
                          ).toLocaleString("vi-VN")}
                          đ
                        </span>
                      </div>
                    )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {t("orders.shipping_fee")}
                    </span>
                    <span className="font-medium text-green-700">
                      {t("orders.free")}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      {t("orders.total")}
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {(
                        order.paymentDetails?.paymentAmount ||
                        order.totalPrice ||
                        originalTotalPrice
                      ).toLocaleString("vi-VN")}
                      đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment & Shipping */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-gray-200/50">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t("orders.payment_shipping")}
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.paymentMethod.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("orders.payment_method")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("orders.order_date")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div
                className={`bg-gradient-to-r ${
                  statusConfig.bgGradient
                } rounded-2xl shadow-xl border-2 ${
                  statusConfig.color.split(" ")[2]
                } overflow-hidden`}
              >
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                    {statusConfig.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {statusConfig.label}
                  </h3>
                  <p className="text-sm opacity-80">
                    {order.status === "delivered"
                      ? t("orders.delivered_successfully")
                      : order.status === "shipped"
                      ? t("orders.shipped_on_the_way")
                      : t("orders.processing")}
                  </p>
                </div>
              </div>

              {/* Cancel Order Button - Only show for pending orders */}
              {order.status === "pending" && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                  <div className="p-6">
                    <Button
                      onClick={handleCancelOrder}
                      disabled={isCancelling}
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                      variant="destructive"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      {isCancelling ? "Đang hủy..." : "Hủy đơn hàng"}
                    </Button>
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Bạn chỉ có thể hủy đơn hàng ở trạng thái "pending"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetails;
