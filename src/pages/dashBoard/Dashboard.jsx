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

        setData(response.data || {});
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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

  return (
    <>
      <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="flex items-center p-8 bg-white shadow rounded-lg">
          <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-purple-600 bg-purple-100 rounded-full mr-6">
            <MdBook className="h-6 w-6" />
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
            <span>Recent Orders</span>
            <span className="text-sm text-gray-500">
              {data.recentOrders?.length || 0} orders
            </span>
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 300px)" }}
          >
            {!data.recentOrders?.length ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No recent orders available
              </div>
            ) : (
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
                    <div className="h-16 w-12 mr-3 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={
                          book.coverImage || "https://via.placeholder.com/48x64"
                        }
                        alt={`${book.title} cover`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {book.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {book.author}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {book.totalSold} sold
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {book.stock} in stock
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {book.totalRevenue.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {book.orderCount} orders
                      </p>
                      <p className="text-xs text-gray-400">
                        {book.stockPercentage.toFixed(1)}% sold
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
