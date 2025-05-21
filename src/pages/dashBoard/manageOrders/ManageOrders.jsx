import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  useDeleteOrderMutation,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from "../../../redux/features/orders/ordersApi";
import Loading from "../../../components/Loading";

const ManageOrders = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user || user.role !== "admin") {
      Swal.fire({
        title: "Unauthorized",
        text: "Please log in as admin",
        icon: "error",
        confirmButtonText: "Go to Login",
      }).then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/admin");
      });
      return;
    }

    setIsAuthenticated(true);
  }, [navigate]);

  const { data, isLoading, isError, error, refetch } = useGetAllOrdersQuery(
    undefined,
    {
      skip: !isAuthenticated,
    }
  );
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  // Handle authentication errors
  if (isError) {
    if (error?.status === 401 || error?.status === 403) {
      Swal.fire({
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
        icon: "error",
        confirmButtonText: "Go to Login",
      }).then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/admin");
      });
      return null;
    }
    return (
      <div>Error loading orders: {error?.data?.message || "Unknown error"}</div>
    );
  }

  if (!isAuthenticated || isLoading) return <Loading />;

  const orders = Array.isArray(data?.data) ? data.data : [];

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
      if (error?.status === 401 || error?.status === 403) {
        Swal.fire({
          title: "Session Expired",
          text: "Your session has expired. Please log in again.",
          icon: "error",
          confirmButtonText: "Go to Login",
        }).then(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/admin");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to update order status.",
        });
      }
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await deleteOrder(orderId).unwrap();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Order deleted successfully!",
        });
        refetch();
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      if (error?.status === 401 || error?.status === 403) {
        Swal.fire({
          title: "Session Expired",
          text: "Your session has expired. Please log in again.",
          icon: "error",
          confirmButtonText: "Go to Login",
        }).then(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/admin");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to delete order.",
        });
      }
    }
  };

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
        .map((item) => {
          if (typeof item === "object" && item !== null) {
            return `${item.productId?.title || "Unknown Product"} (${
              item.quantity || 1
            })`;
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
          <p><strong>Payment Method:</strong> ${
            order.paymentMethod?.name || "N/A"
          }</p>
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
                      {order.name || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {order.email || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {order.totalPrice.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }) || 0}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {order.status || "pending"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 space-x-2">
                      <button
                        onClick={() =>
                          handleUpdateStatus(order._id, "processing")
                        }
                        className={`px-2 py-1 rounded ${
                          order.status === "processing"
                            ? "bg-blue-700 text-white font-bold"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {order.status === "processing" && "✔ "}Processing
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order._id, "shipped")}
                        className={`px-2 py-1 rounded ${
                          order.status === "shipped"
                            ? "bg-yellow-700 text-white font-bold"
                            : "bg-yellow-500 text-white"
                        }`}
                      >
                        {order.status === "shipped" && "✔ "}Shipped
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(order._id, "delivered")
                        }
                        className={`px-2 py-1 rounded ${
                          order.status === "delivered"
                            ? "bg-green-700 text-white font-bold"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {order.status === "delivered" && "✔ "}Delivered
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(order._id, "completed")
                        }
                        className={`px-2 py-1 rounded ${
                          order.status === "completed"
                            ? "bg-green-700 text-white font-bold"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {order.status === "completed" && "✔ "}Completed
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(order._id, "cancelled")
                        }
                        className={`px-2 py-1 rounded ${
                          order.status === "cancelled"
                            ? "bg-red-700 text-white font-bold"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {order.status === "cancelled" && "✔ "}Cancelled
                      </button>
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="px-2 py-1 bg-gray-500 text-white rounded"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="px-2 py-1 bg-gray-500 text-white rounded"
                      >
                        Delete
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
