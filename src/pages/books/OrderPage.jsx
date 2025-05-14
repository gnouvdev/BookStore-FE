import React, { useEffect } from "react";
  import { useGetOrdersQuery } from "../../redux/features/orders/ordersApi";
  import { useAuth } from "../../context/AuthContext";
  import { toast } from "react-hot-toast";
  import { useNavigate } from "react-router-dom";
  import { useTranslation } from "react-i18next";

  const OrderPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { data, isLoading, isError, error } = useGetOrdersQuery(currentUser?.email, {
      skip: !currentUser?.email,
    });

    // Extract orders from data.data
    const orders = data?.data || [];

    // Log orders data and user info for debugging
    useEffect(() => {
      console.log("Current user:", currentUser);
      console.log("Raw API data:", data);
      console.log("Orders data:", orders);
      console.log("Is orders an array?", Array.isArray(orders));
      console.log("Current user email:", currentUser?.email);
      orders.forEach((order, index) => {
        console.log(`Order ${index + 1} productIds:`, order.productIds);
      });
      if (isError) {
        console.error("Error fetching orders:", error);
      }
    }, [data, orders, currentUser, isError, error]);

    if (!currentUser || !currentUser.email) {
      return (
        <div className="container mx-auto p-6">
          <p className="text-red-600">{t('orders.login_required')}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            {t('orders.go_to_login')}
          </button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="container mx-auto p-6 flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (isError) {
      const errorMessage = error?.data?.message || t('orders.error_loading');
      toast.error(errorMessage);
      if (error?.status === 401) {
        toast.error(t('orders.session_expired'));
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return null;
      }
      return <p className="container mx-auto p-6 text-red-600">{errorMessage}</p>;
    }

    return (
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">{t('orders.title')}</h2>
        {orders.length === 0 ? (
          <p>{t('orders.no_orders')}</p>
        ) : (
          orders.map((order, index) => (
            <div key={order._id} className="border-b mb-4 pb-4">
              <p className="p-1 bg-secondary text-white w-10 rounded mb-1"># {index + 1}</p>
              <h2 className="font-bold">{t('orders.order_id')}: {order._id}</h2>
              <p className="text-gray-600">{t('orders.name')}: {order.name || "N/A"}</p>
              <p className="text-gray-600">{t('orders.email')}: {order.email || "N/A"}</p>
              <p className="text-gray-600">{t('orders.phone')}: {order.phone || "N/A"}</p>
              <p className="text-gray-600">{t('orders.status')}: {order.status || "N/A"}</p>
              <p className="text-gray-600">{t('orders.total_price')}: ${order.totalPrice?.toFixed(2) || "N/A"}</p>

              <h3 className="font-semibold mt-2">{t('orders.address')}:</h3>
              <p>
                {order.address?.city || ""}
                {order.address?.state && `, ${order.address.state}`}
                {order.address?.country && `, ${order.address.country}`}
                {order.address?.zipcode && `, ${order.address.zipcode}`}
                {!order.address?.city && "N/A"}
              </p>

              <h3 className="font-semibold mt-2">{t('orders.products')}:</h3>
              <ul>
                {order.productIds?.length > 0 ? (
                  order.productIds.map((product) => (
                    <li key={product._id}>
                      {product.title || product._id || "Unknown Product"}
                    </li>
                  ))
                ) : (
                  <li>{t('orders.no_products')}</li>
                )}
              </ul>

              <button
                onClick={() => navigate(`/order/${order._id}`)}
                className="mt-2 bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
              >
                {t('orders.view_details')}
              </button>
            </div>
          ))
        )}
      </div>
    );
  };

  export default OrderPage;