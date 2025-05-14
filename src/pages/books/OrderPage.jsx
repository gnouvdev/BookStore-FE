import React, { useEffect, useState } from "react";
import { useGetOrdersQuery } from "../../redux/features/orders/ordersApi";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaBox, FaSearch } from "react-icons/fa";

const OrderPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error } = useGetOrdersQuery(
    currentUser?.email,
    {
      skip: !currentUser?.email,
    }
  );

  const orders = data?.data || [];

  // Lọc và tìm kiếm đơn hàng
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

  // Debugging logs
  useEffect(() => {
    console.log("Current user:", currentUser);
    console.log("Raw API data:", data);
    console.log("Orders data:", orders);
    console.log("Filtered orders:", filteredOrders);
    console.log("Is orders an array?", Array.isArray(orders));
    console.log("Current user email:", currentUser?.email);
    orders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`, order);
      console.log(`Order ${index + 1} productIds:`, order.productIds);
      if (order.productIds) {
        order.productIds.forEach((product, pIndex) => {
          console.log(`Product ${pIndex + 1} in Order ${index + 1}:`, product);
        });
      }
    });
    if (isError) {
      console.error("Error fetching orders:", error);
    }
  }, [data, orders, currentUser, isError, error, filteredOrders]);

  // Handle unauthenticated users
  if (!currentUser || !currentUser.email) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium mb-4">
            {t("orders.login_required")}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            aria-label={t("order.go_to_login")}
          >
            {t("order.go_to_login")}
          </button>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    const errorMessage = error?.data?.message || t("order.error_loading");
    toast.error(errorMessage);
    if (error?.status === 401) {
      toast.error(t("order.session_expired"));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      return null;
    }
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600 text-lg font-medium">{errorMessage}</p>
      </div>
    );
  }

  // Bộ lọc trạng thái
  const filters = [
    { key: "all", label: t("order.filter_all") },
    { key: "pending", label: t("order.filter_pending") },
    { key: "shipped", label: t("order.filter_shipped") },
    { key: "delivered", label: t("order.filter_delivered") },
    { key: "completed", label: t("order.filter_completed") },
  ];

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {/* Header */}
      <h2 className="text-3xl font-bold text-gray-800 flex items-center mb-6">
        <FaBox className="mr-2 text-blue-600" /> {t("order.title")}
      </h2>

      {/* Bộ lọc trạng thái */}
      <div className="flex flex-wrap gap-4 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white"
            }`}
            aria-label={`Filter by ${f.label}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Thanh tìm kiếm */}
      <div className="mb-6">
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("order.search_placeholder")}
            className="w-full py-2 px-4 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label={t("order.search_placeholder")}
          />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Bảng đơn hàng */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">{t("order.no_orders")}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("order.shop_now")}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            console.log("Order data:", order);
            return (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                {/* Header với mã đơn hàng và trạng thái */}
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("order.order_id")}: {order._id.slice(-8)}
                  </h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "pending"
                        ? "bg-red-100 text-red-600"
                        : order.status === "shipped"
                        ? "bg-blue-100 text-blue-600"
                        : order.status === "delivered"
                        ? "bg-green-100 text-green-600"
                        : order.status === "completed"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status || "N/A"}
                  </span>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="space-y-4">
                  {order.productIds?.length > 0 ? (
                    order.productIds.map((item) => {
                      console.log("Order item:", item);
                      const product = item.productId || item;
                      const quantity = item.quantity || 1;

                      if (!product._id || !product.title) {
                        console.error("Invalid product data:", product);
                        return (
                          <div
                            key={item._id || Math.random()}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <img
                                src="https://via.placeholder.com/50?text=Book"
                                alt="Unknown Product"
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div>
                                <h4 className="text-base font-medium text-gray-800">
                                  Unknown Product
                                </h4>
                                <p className="text-sm text-gray-500">
                                  x{quantity}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-medium text-gray-800">
                                N/A
                              </p>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={product._id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <img
                              src={
                                product.coverImage ||
                                "https://via.placeholder.com/50?text=Book"
                              }
                              alt={product.title || "Product"}
                              className="w-16 h-16 object-contain rounded"
                            />
                            <div>
                              <h4 className="text-base font-medium text-gray-800">
                                {product.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                x{quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-medium text-gray-800">
                              {(
                                (product.price?.newPrice ||
                                  product.price ||
                                  0) * quantity
                              ).toLocaleString("vi-VN")}
                              đ
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">{t("order.no_products")}</p>
                    </div>
                  )}
                </div>

                {/* Tổng tiền và nút đánh giá */}
                <div className="mt-6 flex flex-col items-end space-y-3">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-800">
                      {t("order.total_price")}:{" "}
                      {order.totalPrice?.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                  {order.status === "completed" && (
                    <button
                      onClick={() => {
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
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      {t("orders.review")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderPage;
