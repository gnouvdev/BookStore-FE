import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);

  // Lấy danh sách đơn hàng
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to fetch orders.",
        });
      }
    };

    fetchOrders();
  }, []);

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, status: response.data.status }
            : order
        )
      );
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Order status updated successfully!",
      });
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
    const itemsHtml = order.productIds
      .map(
        (item) => `
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;" />
            <div>
              <p><strong>${item.name}</strong></p>
              <p>Quantity: ${item.quantity}</p>
              <p>Price: $${item.price}</p>
            </div>
          </div>
        `
      )
      .join("");

    Swal.fire({
      title: "Order Details",
      html: `
        <div>
          <p><strong>Name:</strong> ${order.name}</p>
          <p><strong>Email:</strong> ${order.email}</p>
          <p><strong>Total Price:</strong> $${order.totalPrice}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <hr />
          <h3>Items:</h3>
          ${itemsHtml}
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
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">#</th>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2">
                  Total Price
                </th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id}>
                  <td className="border border-gray-300 px-4 py-2">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {order.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {order.email}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    ${order.totalPrice}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {order.status}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 space-x-2">
                    <button
                      onClick={() =>
                        handleUpdateStatus(order._id, "Đang giao hàng")
                      }
                      className={`px-2 py-1 rounded ${
                        order.status === "Đang giao hàng"
                          ? "bg-blue-700 text-white font-bold"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {order.status === "Đang giao hàng" && "✔ "}Đang giao hàng
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(order._id, "Hủy đơn hàng")
                      }
                      className={`px-2 py-1 rounded ${
                        order.status === "Hủy đơn hàng"
                          ? "bg-red-700 text-white font-bold"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {order.status === "Hủy đơn hàng" && "✔ "}Hủy đơn hàng
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order._id, "Đã giao")}
                      className={`px-2 py-1 rounded ${
                        order.status === "Đã giao"
                          ? "bg-green-700 text-white font-bold"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {order.status === "Đã giao" && "✔ "}Đã giao
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
      </div>
    </section>
  );
};

export default ManageOrders;
