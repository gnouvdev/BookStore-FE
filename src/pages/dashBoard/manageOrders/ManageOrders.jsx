import React from "react";
import Swal from "sweetalert2";
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from "../../../redux/features/orders/ordersApi";

const ManageOrders = () => {
  const { data, isLoading, isError, error, refetch } = useGetAllOrdersQuery();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const orders = Array.isArray(data?.data) ? data.data : [];

  if (isLoading) return <div>Loading...</div>;
  if (isError) {
    console.error("Error loading orders:", error);
    return <div>Error loading orders: {error?.data?.message || "Unknown error"}</div>;
  }

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, status) => {
    try {
      await updateOrderStatus({ id: orderId, status }).unwrap();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Order status updated successfully!",
      });
      refetch();
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to update order status.",
      });
    }
  };

  // Xem chi tiết đơn hàng
  const handleViewDetails = (order) => {
    const formatAddress = (address) => {
      if (!address) return "No address provided";
      const parts = [
        address.street,
        address.city,
        address.state,
        address.country,
        address.zipcode,
      ].filter(Boolean);
      return parts.join(", ") || "No address provided";
    };

    const formatProducts = (products) => {
      if (!products || !Array.isArray(products)) return "No products";
      return products
        .map((product) => {
          if (typeof product === "object" && product !== null) {
            return `${product.title || "Unknown Product"}`;
          }
          return "Unknown Product";
        })
        .join("<br>");
    };

    Swal.fire({
      title: "Order Details",
      html: `
        <div>
          <p><strong>Name:</strong> ${order.name || "N/A"}</p>
          <p><strong>Email:</strong> ${order.email || "N/A"}</p>
          <p><strong>Phone:</strong> ${order.phone || "N/A"}</p>
          <p><strong>Total Price:</strong> $${order.totalPrice || 0}</p>
          <p><strong>Status:</strong> ${order.status || "pending"}</p>
          <hr />
          <h3>Address:</h3>
          <p>${formatAddress(order.address)}</p>
          <hr />
          <h3>Products:</h3>
          <p>${formatProducts(order.productIds)}</p>
        </div>
      `,
      icon: "info",
      width: "600px",
    });
  };

  return (
    <section className="py-6">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Manage Orders</h1>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">#</th>
                  <th className="border border-gray-300 px-4 py-2">Name</th>
                  <th className="border border-gray-300 px-4 py-2">Email</th>
                  <th className="border border-gray-300 px-4 py-2">Total Price</th>
                  <th className="border border-gray-300 px-4 py-2">Status</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={order._id}>
                    <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{order.name || "N/A"}</td>
                    <td className="border border-gray-300 px-4 py-2">{order.email || "N/A"}</td>
                    <td className="border border-gray-300 px-4 py-2">${order.totalPrice || 0}</td>
                    <td className="border border-gray-300 px-4 py-2">{order.status || "pending"}</td>
                    <td className="border border-gray-300 px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(order._id, "processing")}
                        className={`px-2 py-1 rounded ${
                          order.status === "processing"
                            ? "bg-blue-700 text-white font-bold"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {order.status === "processing" && "✔ "}Processing
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order._id, "cancelled")}
                        className={`px-2 py-1 rounded ${
                          order.status === "cancelled"
                            ? "bg-red-700 text-white font-bold"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {order.status === "cancelled" && "✔ "}Cancelled
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order._id, "completed")}
                        className={`px-2 py-1 rounded ${
                          order.status === "completed"
                            ? "bg-green-700 text-white font-bold"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {order.status === "completed" && "✔ "}Completed
                      </button>
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="px-2 py-1 bg-gray-500 text-white rounded"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default ManageOrders;