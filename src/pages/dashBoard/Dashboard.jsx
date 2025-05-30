"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  DollarSign,
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Eye,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Download,
  BarChart2,
  PieChart,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import RevenueChart from "./RevenueChart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import baseUrl from "../../utils/baseURL";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import CustomDialog from "@/components/ui/custom-dialog";

const ImprovedDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({
    sales: [],
    orders: [],
    users: [],
    inventory: [],
  });
  const [data, setData] = useState({
    totalBooks: 0,
    totalSales: 0,
    trendingBooks: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0,
    monthlySales: [],
    recentOrders: [],
    topSellingBooks: [],
  });
  const [reportType, setReportType] = useState("sales");
  const [dateRange] = useState("30days");
  const [customDateRange] = useState(null);
  const navigate = useNavigate();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to continue");
        navigate("/admin");
        return;
      }

      // Fetch all required data in parallel
      const [overviewRes, salesRes, ordersRes, booksRes] = await Promise.all([
        axios.get(`${baseUrl}/admin/dashboard/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}/admin/dashboard/sales`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}/admin/dashboard/recent-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}/admin/dashboard/top-books`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Update dashboard data
      setData({
        totalBooks: overviewRes.data.totalBooks,
        totalSales: overviewRes.data.totalSales,
        trendingBooks: overviewRes.data.trendingBooks,
        totalOrders: overviewRes.data.totalOrders,
        totalUsers: overviewRes.data.totalUsers,
        pendingOrders: overviewRes.data.pendingOrders,
        completedOrders: overviewRes.data.completedOrders,
        averageOrderValue: overviewRes.data.averageOrderValue,
        monthlySales: salesRes.data,
        recentOrders: ordersRes.data,
        topSellingBooks: booksRes.data,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(
        error.response?.data?.message || "Failed to load dashboard data"
      );
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch report data when modal opens
  useEffect(() => {
    if (showReportModal) {
      fetchReportData();
    }
  }, [showReportModal, reportType]);

  const fetchReportData = async () => {
    try {
      setReportLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to continue");
        navigate("/admin");
        return;
      }

      const startDate = getStartDate();
      const endDate = getEndDate();
      const dateParams = startDate
        ? `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        : "";

      // Fetch data based on report type
      switch (reportType) {
        case "sales": {
          const [overviewRes, salesRes] = await Promise.all([
            axios.get(`${baseUrl}/admin/dashboard/overview${dateParams}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${baseUrl}/admin/dashboard/sales${dateParams}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          setReportData((prev) => ({
            ...prev,
            sales: {
              overview: overviewRes.data,
              monthlyData: salesRes.data,
            },
          }));
          break;
        }
        case "orders": {
          const [overviewRes, ordersRes] = await Promise.all([
            axios.get(`${baseUrl}/admin/dashboard/overview${dateParams}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${baseUrl}/admin/dashboard/recent-orders${dateParams}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          setReportData((prev) => ({
            ...prev,
            orders: {
              overview: overviewRes.data,
              orders: ordersRes.data,
            },
          }));
          break;
        }
        case "inventory": {
          const [overviewRes, booksRes] = await Promise.all([
            axios.get(`${baseUrl}/admin/dashboard/overview${dateParams}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${baseUrl}/admin/dashboard/top-books${dateParams}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          setReportData((prev) => ({
            ...prev,
            inventory: {
              overview: overviewRes.data,
              books: booksRes.data,
            },
          }));
          break;
        }
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error(
        error.response?.data?.message || "Failed to load report data"
      );
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin");
      }
    } finally {
      setReportLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

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
        return <Clock className="w-3 h-3" />;
      case "processing":
        return <Package className="w-3 h-3" />;
      case "shipped":
        return <TrendingUp className="w-3 h-3" />;
      case "delivered":
        return <CheckCircle className="w-3 h-3" />;
      case "cancelled":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const exportReport = async (type) => {
    try {
      const token = localStorage.getItem("token");
      const startDate = getStartDate();
      const endDate = getEndDate();
      const dateParams = startDate
        ? `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        : "";

      const response = await axios.get(
        `${baseUrl}/admin/dashboard/export/${type}${dateParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${type}-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  // Add date helper functions
  const getStartDate = () => {
    const now = new Date();
    switch (dateRange) {
      case "7days":
        return new Date(now.setDate(now.getDate() - 7));
      case "30days":
        return new Date(now.setDate(now.getDate() - 30));
      case "90days":
        return new Date(now.setDate(now.getDate() - 90));
      case "custom":
        return customDateRange?.from || null;
      default:
        return new Date(now.setDate(now.getDate() - 30));
    }
  };

  const getEndDate = () => {
    if (dateRange === "custom" && customDateRange?.to) {
      return customDateRange.to;
    }
    return new Date();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="animate-pulse space-y-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Last 30 days
          </Button>
          <CustomDialog
            open={showReportModal}
            onOpenChange={setShowReportModal}
            trigger={
              <Button className="gap-2">
                <Eye className="w-4 h-4" />
                View Reports
              </Button>
            }
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                Advanced Analytics & Reports
              </div>
            }
            description="Comprehensive insights and detailed reports for your business"
          >
            <div className="flex flex-col lg:flex-row gap-6 mt-6 flex-1 overflow-hidden">
              {/* Left Sidebar - Report Types */}
              <div className="lg:w-80 space-y-3 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Report Categories
                </h3>

                {[
                  {
                    key: "sales",
                    title: "Sales Analytics",
                    description: "Revenue trends and performance",
                    icon: DollarSign,
                    color: "blue",
                    stats: reportData.sales?.overview
                      ? formatCurrency(reportData.sales.overview.totalSales)
                      : formatCurrency(0),
                  },
                  {
                    key: "orders",
                    title: "Order Management",
                    description: "Order statistics and tracking",
                    icon: ShoppingCart,
                    color: "green",
                    stats: reportData.orders?.overview
                      ? `${reportData.orders.overview.totalOrders} orders`
                      : "0 orders",
                  },
                  {
                    key: "users",
                    title: "Customer Insights",
                    description: "User behavior and demographics",
                    icon: Users,
                    color: "purple",
                    stats: reportData.users?.overview
                      ? `${reportData.users.overview.totalUsers} users`
                      : "0 users",
                  },
                  {
                    key: "inventory",
                    title: "Inventory Report",
                    description: "Stock levels and book performance",
                    icon: BookOpen,
                    color: "orange",
                    stats: reportData.inventory?.overview
                      ? `${reportData.inventory.overview.totalBooks} books`
                      : "0 books",
                  },
                ].map((report) => (
                  <div
                    key={report.key}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      reportType === report.key
                        ? `border-${report.color}-500 bg-${report.color}-50 shadow-lg`
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                    onClick={() => setReportType(report.key)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 bg-${report.color}-100 rounded-lg`}>
                        <report.icon
                          className={`w-5 h-5 text-${report.color}-600`}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {report.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {report.description}
                        </p>
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {report.stats}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Content - Report Details */}
              <div className="flex-1 overflow-y-auto">
                <div className="bg-gray-50 rounded-xl p-6">
                  {reportLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <>
                      {/* Report Header */}
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {reportType === "sales" &&
                              "Sales Analytics Dashboard"}
                            {reportType === "orders" &&
                              "Order Management Report"}
                            {reportType === "users" &&
                              "Customer Insights Report"}
                            {reportType === "inventory" &&
                              "Inventory Analysis Report"}
                          </h3>
                          <p className="text-gray-500 mt-1">
                            {dateRange === "all"
                              ? "All time data"
                              : dateRange === "30days"
                              ? "Last 30 days"
                              : dateRange === "7days"
                              ? "Last 7 days"
                              : "Today's data"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-2">
                            <FileText className="w-4 h-4" />
                            PDF
                          </Button>
                          <Button
                            onClick={() => exportReport(reportType)}
                            className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          >
                            <Download className="w-4 h-4" />
                            Export Excel
                          </Button>
                        </div>
                      </div>

                      {/* Report Content */}
                      <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {reportType === "sales" &&
                            reportData.sales?.overview && (
                              <>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <DollarSign className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        Total Revenue
                                      </p>
                                      <p className="text-xl font-bold text-gray-900">
                                        {formatCurrency(
                                          reportData.sales.overview.totalSales
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                      <TrendingUp className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        Avg Order Value
                                      </p>
                                      <p className="text-xl font-bold text-gray-900">
                                        {formatCurrency(data.averageOrderValue)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                      <ShoppingCart className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        Total Orders
                                      </p>
                                      <p className="text-xl font-bold text-gray-900">
                                        {data.totalOrders.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                          {reportType === "orders" &&
                            reportData.orders?.overview && (
                              <>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                      <Clock className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        Pending Orders
                                      </p>
                                      <p className="text-xl font-bold text-gray-900">
                                        {
                                          reportData.orders.overview
                                            .pendingOrders
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        Completed
                                      </p>
                                      <p className="text-xl font-bold text-gray-900">
                                        {data.completedOrders}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <Package className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        Processing
                                      </p>
                                      <p className="text-xl font-bold text-gray-900">
                                        {data.totalOrders -
                                          data.pendingOrders -
                                          data.completedOrders}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                          {reportType === "users" &&
                            reportData.users?.overview && (
                              <>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                      <Users className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        Total Users
                                      </p>
                                      <p className="text-xl font-bold text-gray-900">
                                        {data.totalUsers.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                      <TrendingUp className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        Active Users
                                      </p>
                                      <p className="text-xl font-bold text-gray-900">
                                        {Math.floor(
                                          data.totalUsers * 0.7
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <Star className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        New Users
                                      </p>
                                      <p className="text-xl font-bold text-gray-900">
                                        {Math.floor(
                                          data.totalUsers * 0.15
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                          {reportType === "inventory" &&
                            reportData.inventory?.overview && (
                              <>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                      <BookOpen className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        Total Books
                                      </p>
                                      <p className="text-xl font-bold text-gray-900">
                                        {reportData.inventory.overview.totalBooks.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                      <AlertCircle className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        Low Stock
                                      </p>
                                      <p className="text-xl font-bold text-gray-900">
                                        {Math.floor(data.totalBooks * 0.1)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                      <TrendingUp className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        Best Sellers
                                      </p>
                                      <p className="text-xl font-bold text-gray-900">
                                        {data.topSellingBooks.length}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                        </div>

                        {/* Chart Visualization */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-4">
                            Trend Analysis
                          </h4>
                          <div className="h-[400px] min-h-[400px] max-h-[400px]">
                            {reportType === "sales" &&
                              reportData.sales?.monthlyData && (
                                <div className="h-full">
                                  <RevenueChart
                                    data={reportData.sales.monthlyData}
                                  />
                                </div>
                              )}
                            {reportType === "orders" && (
                              <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                  <TrendingUp className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                  <p className="text-gray-500">
                                    Order trends visualization
                                  </p>
                                  <p className="text-sm text-gray-400 mt-2">
                                    Order volume and status distribution
                                  </p>
                                </div>
                              </div>
                            )}
                            {reportType === "users" && (
                              <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                  <PieChart className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                                  <p className="text-gray-500">
                                    User analytics dashboard
                                  </p>
                                  <p className="text-sm text-gray-400 mt-2">
                                    User engagement and growth metrics
                                  </p>
                                </div>
                              </div>
                            )}
                            {reportType === "inventory" && (
                              <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                  <Package className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                                  <p className="text-gray-500">
                                    Inventory analysis charts
                                  </p>
                                  <p className="text-sm text-gray-400 mt-2">
                                    Stock levels and performance metrics
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Detailed Data Table */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h4 className="font-semibold text-gray-900">
                              Detailed Breakdown
                            </h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  {reportType === "sales" && (
                                    <>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Period
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Revenue
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Orders
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Avg Order
                                      </th>
                                    </>
                                  )}
                                  {reportType === "orders" && (
                                    <>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Order ID
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Customer
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Total
                                      </th>
                                    </>
                                  )}
                                  {reportType === "users" && (
                                    <>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        User
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Orders
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Total Spent
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Last Order
                                      </th>
                                    </>
                                  )}
                                  {reportType === "inventory" && (
                                    <>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Book
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Stock
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Sold
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Revenue
                                      </th>
                                    </>
                                  )}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {reportType === "sales" &&
                                  reportData.sales?.monthlyData
                                    ?.slice(0, 5)
                                    .map((item) => (
                                      <tr
                                        key={item.monthName}
                                        className="hover:bg-gray-50"
                                      >
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                          {item.monthName}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                          {formatCurrency(item.totalSales)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                          {item.totalOrders}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                          {formatCurrency(
                                            item.averageOrderValue
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                {reportType === "orders" &&
                                  reportData.orders?.orders
                                    ?.slice(0, 5)
                                    .map((order) => (
                                      <tr
                                        key={order._id}
                                        className="hover:bg-gray-50"
                                      >
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                          #{order._id.slice(-6)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                          {order.user.fullName}
                                        </td>
                                        <td className="px-4 py-3">
                                          <Badge
                                            className={`text-xs ${getStatusColor(
                                              order.status
                                            )}`}
                                            variant="secondary"
                                          >
                                            {order.status}
                                          </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                          {formatCurrency(order.totalPrice)}
                                        </td>
                                      </tr>
                                    ))}
                                {reportType === "inventory" &&
                                  reportData.inventory?.books
                                    ?.slice(0, 5)
                                    .map((book) => (
                                      <tr
                                        key={book._id}
                                        className="hover:bg-gray-50"
                                      >
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                          {book.title}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                          {book.stock}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                          {book.totalSold}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                          {formatCurrency(book.totalRevenue)}
                                        </td>
                                      </tr>
                                    ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CustomDialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Books</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data.totalBooks.toLocaleString()}
              </p>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">
                  {data.trendingBooks > 0 ? "+" : ""}
                  {data.trendingBooks}%
                </span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(data.totalSales)}
              </p>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">
                  {data.monthlySales.length > 1
                    ? (
                        ((data.monthlySales[data.monthlySales.length - 1]
                          .totalSales -
                          data.monthlySales[data.monthlySales.length - 2]
                            .totalSales) /
                          data.monthlySales[data.monthlySales.length - 2]
                            .totalSales) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data.totalOrders.toLocaleString()}
              </p>
              <div className="flex items-center mt-2 text-sm">
                {data.monthlySales.length > 1 ? (
                  data.monthlySales[data.monthlySales.length - 1].totalOrders >
                  data.monthlySales[data.monthlySales.length - 2]
                    .totalOrders ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                  )
                ) : null}
                <span
                  className={`font-medium ${
                    data.monthlySales.length > 1
                      ? data.monthlySales[data.monthlySales.length - 1]
                          .totalOrders >
                        data.monthlySales[data.monthlySales.length - 2]
                          .totalOrders
                        ? "text-green-600"
                        : "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {data.monthlySales.length > 1
                    ? (
                        ((data.monthlySales[data.monthlySales.length - 1]
                          .totalOrders -
                          data.monthlySales[data.monthlySales.length - 2]
                            .totalOrders) /
                          data.monthlySales[data.monthlySales.length - 2]
                            .totalOrders) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data.totalUsers.toLocaleString()}
              </p>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">
                  {data.monthlySales.length > 1
                    ? (
                        ((data.totalUsers - data.totalUsers * 0.85) /
                          (data.totalUsers * 0.85)) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <RevenueChart data={data.monthlySales} />
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h3>
              <Badge variant="secondary">{data.recentOrders.length}</Badge>
            </div>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-6 space-y-4">
              {data.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={order.user.photoURL || "/placeholder.svg"}
                      alt={order.user.fullName}
                    />
                    <AvatarFallback>
                      {order.user.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {order.user.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(order.createdAt), "MMM dd, HH:mm")}
                    </p>
                    <Badge
                      className={`text-xs mt-1 ${getStatusColor(order.status)}`}
                      variant="secondary"
                    >
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.totalPrice)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.productIds.length} items
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Top Selling Books */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Selling Books
            </h3>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.topSellingBooks.slice(0, 4).map((book, index) => (
              <div
                key={book._id}
                className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={book.coverImage || "/placeholder.svg"}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center p-0">
                    {index + 1}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {book.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {book.author}
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {book.totalSold} sold
                    </Badge>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-500 ml-1">4.8</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatCurrency(book.totalRevenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedDashboard;
