import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import baseUrl from "../../utils/baseURL";
import {
  MdIncompleteCircle,
  MdTrendingUp,
  MdShoppingCart,
  MdPerson,
  MdBook,
} from "react-icons/md";
import RevenueChart from "./RevenueChart";
import Loading from "../../components/Loading";
import { format } from "date-fns";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalBooks: 0,
    totalSales: 0,
    trendingBooks: 0,
    totalOrders: 0,
    topUsers: [],
    recentOrders: [],
    topSellingBooks: [],
    averageOrderValue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/admin`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Dashboard API Response:", response.data);
        console.log("Top Users:", response.data.topUsers);
        console.log("Top Selling Books:", response.data.topSellingBooks);
        console.log("Monthly Sales:", response.data.monthlySales);

        setData(response.data || {});
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        console.error("Error details:", {
          status: error.response?.status,
          message: error.response?.data?.message,
          data: error.response?.data,
        });
        setLoading(false);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/admin");
        }
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <Loading />;

  // Debug render
  console.log("Current Dashboard Data:", data);
  console.log("Data Types:", {
    topUsers: Array.isArray(data.topUsers),
    topSellingBooks: Array.isArray(data.topSellingBooks),
    monthlySales: Array.isArray(data.monthlySales),
  });

  return (
    <>
      <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="flex items-center p-8 bg-white shadow rounded-lg">
          <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-purple-600 bg-purple-100 rounded-full mr-6">
            <svg
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <span className="block text-2xl font-bold">{data.totalBooks}</span>
            <span className="block text-gray-500">Total Books</span>
          </div>
        </div>
        <div className="flex items-center p-8 bg-white shadow rounded-lg">
          <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-green-600 bg-green-100 rounded-full mr-6">
            <MdShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold">
              {data.totalSales.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </span>
            <span className="block text-gray-500">Total Sales</span>
            <span className="block text-sm text-gray-400">
              Avg:{" "}
              {data.averageOrderValue.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center p-8 bg-white shadow rounded-lg">
          <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-red-600 bg-red-100 rounded-full mr-6">
            <MdTrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold">
              {data.trendingBooks}
            </span>
            <span className="block text-gray-500">Trending Books</span>
            <span className="block text-sm text-gray-400">
              {((data.trendingBooks / data.totalBooks) * 100).toFixed(1)}% of
              total
            </span>
          </div>
        </div>
        <div className="flex items-center p-8 bg-white shadow rounded-lg">
          <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-blue-600 bg-blue-100 rounded-full mr-6">
            <MdPerson className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold">{data.totalUsers}</span>
            <span className="block text-gray-500">Total Users</span>
            <span className="block text-sm text-gray-400">
              {data.pendingOrders} pending orders
            </span>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-4 xl:grid-rows-3 xl:grid-flow-col gap-6 mt-6">
        <div className="flex flex-col md:col-span-2 md:row-span-2 bg-white shadow rounded-lg">
          <div className="px-6 py-5 font-semibold border-b border-gray-100">
            Monthly Revenue Overview
          </div>
          <div className="p-4 flex-grow">
            <div className="h-[400px]">
              <RevenueChart data={data.monthlySales} />
            </div>
          </div>
        </div>

        <div className="row-span-3 bg-white shadow rounded-lg">
          <div className="flex items-center justify-between px-6 py-5 font-semibold border-b border-gray-100">
            <span>Top Customers</span>
            <span className="text-sm text-gray-500">
              {data.topUsers?.length || 0} customers
            </span>
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 300px)" }}
          >
            {!data.topUsers?.length ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No customer data available
              </div>
            ) : (
              <ul className="p-6 space-y-6">
                {data.topUsers?.map((user, index) => (
                  <li key={user._id} className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      <div className="relative">
                        <div className="h-12 w-12 bg-gray-100 rounded-full overflow-hidden">
                          <img
                            src={
                              user.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.name
                              )}&background=random`
                            }
                            alt={`${user.name}'s profile`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {index + 1}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {user.completedOrders} completed
                        </span>
                        {user.pendingOrders > 0 && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                            {user.pendingOrders} pending
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {user.totalOrders} orders
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.totalSpent.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </p>
                      <p className="text-xs text-gray-400">
                        Last: {format(new Date(user.lastOrderDate), "MMM dd")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="row-span-3 bg-white shadow rounded-lg">
          <div className="flex items-center justify-between px-6 py-5 font-semibold border-b border-gray-100">
            <span>Top Selling Books</span>
            <span className="text-sm text-gray-500">
              {data.topSellingBooks?.length || 0} books
            </span>
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 300px)" }}
          >
            {!data.topSellingBooks?.length ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No book sales data available
              </div>
            ) : (
              <ul className="p-6 space-y-6">
                {data.topSellingBooks?.map((book) => (
                  <li key={book._id} className="flex items-center">
                    <div className="h-20 w-14 mr-3 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/150x200?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {book.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {book.author?.name}
                      </p>
                      <div className="flex items-center mt-1">
                        <p className="text-xs text-gray-400 mr-2">
                          {book.orderCount} orders
                        </p>
                        <p className="text-xs text-gray-400">
                          {book.totalSold} sold
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {typeof book.totalRevenue === "number"
                          ? book.totalRevenue.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })
                          : "0 ₫"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {typeof book.price === "number"
                          ? book.price.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })
                          : "0 ₫"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {typeof book.stockPercentage === "number"
                          ? `${book.stockPercentage.toFixed(1)}% of stock`
                          : "0% of stock"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="row-span-3 bg-white shadow rounded-lg">
          <div className="flex items-center justify-between px-6 py-5 font-semibold border-b border-gray-100">
            <span>Recent Orders</span>
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 300px)" }}
          >
            <ul className="p-6 space-y-6">
              {data.recentOrders?.map((order) => (
                <li key={order._id} className="flex items-center">
                  <div className="h-12 w-12 mr-3 bg-gray-100 rounded-full overflow-hidden">
                    <img
                      src={
                        order.user?.photoURL ||
                        `https://ui-avatars.com/api/?name=${order.user?.fullName}&background=random`
                      }
                      alt={`${order.user?.fullName}'s profile`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {order.user?.fullName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(order.createdAt), "MMM dd, yyyy HH:mm")}
                    </p>
                    <p className="text-xs text-gray-400">{order.status}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {order.totalPrice.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.productIds?.length || 0} items
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
