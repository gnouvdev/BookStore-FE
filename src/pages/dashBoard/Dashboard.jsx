"use client";

import React, { useState, useEffect } from "react";
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
  Brain,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import RevenueChart from "./RevenueChart";
import EnhancedAIBusinessAssistant from "./EnhancedAIBusinessAssistant";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import CustomDialog from "@/components/ui/custom-dialog";
import baseUrl from "../../utils/baseURL";
import { useGetBusinessInsightsQuery } from "../../redux/features/dashboard/dashboardApi";

const ImprovedDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAllTopBooks, setShowAllTopBooks] = useState(false);
  const [reportData, setReportData] = useState({
    sales: { overview: null, monthlyData: [] },
    orders: {
      overview: null,
      orders: [],
      stats: {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        completed: 0,
        cancelled: 0,
      },
    },
    users: { overview: null, users: [] },
    inventory: {
      overview: null,
      books: [],
      stats: { totalBooks: 0, outOfStock: 0, lowStock: 0, inStock: 0 },
    },
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
    categoryStats: [],
  });
  const [reportType, setReportType] = useState("sales");
  const [dateRange] = useState("30days");
  const [customDateRange] = useState(null);
  const [chartDateRange, setChartDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const navigate = useNavigate();

  // Use RTK Query for business insights
  const {
    data: businessInsightsData,
    isLoading: insightsLoading,
    refetch: refetchInsights,
  } = useGetBusinessInsightsQuery();
  const businessInsights = businessInsightsData?.data || businessInsightsData;

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

      // Build monthly sales URL with date range if provided
      let monthlySalesUrl = `${baseUrl}/admin/dashboard/monthly-sales`;
      if (chartDateRange.startDate || chartDateRange.endDate) {
        const params = new URLSearchParams();
        if (chartDateRange.startDate)
          params.append("startDate", chartDateRange.startDate);
        if (chartDateRange.endDate)
          params.append("endDate", chartDateRange.endDate);
        monthlySalesUrl += `?${params.toString()}`;
      }

      // Fetch all required data in parallel
      const [overviewRes, salesRes, ordersRes, booksRes] = await Promise.all([
        axios.get(`${baseUrl}/admin/dashboard/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(monthlySalesUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}/admin/dashboard/recent-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}/admin/dashboard/top-selling-books`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Update dashboard data with proper data structure
      setData({
        totalBooks: overviewRes.data?.totalBooks || 0,
        totalSales: overviewRes.data?.totalSales || 0,
        trendingBooks: overviewRes.data?.trendingBooks || 0,
        totalOrders: overviewRes.data?.totalOrders || 0,
        totalUsers: overviewRes.data?.totalUsers || 0,
        pendingOrders: overviewRes.data?.pendingOrders || 0,
        completedOrders: overviewRes.data?.completedOrders || 0,
        averageOrderValue: overviewRes.data?.averageOrderValue || 0,
        monthlySales: Array.isArray(salesRes.data) ? salesRes.data : [],
        recentOrders: Array.isArray(ordersRes.data?.orders)
          ? ordersRes.data.orders
          : [],
        topSellingBooks: Array.isArray(booksRes.data?.books)
          ? booksRes.data.books
          : [],
        categoryStats: Array.isArray(booksRes.data?.categoryStats)
          ? booksRes.data.categoryStats
          : [],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch monthly sales when date range changes
  useEffect(() => {
    if (chartDateRange.startDate || chartDateRange.endDate) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartDateRange]);

  // Fetch report data when modal opens
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
            axios.get(`${baseUrl}/admin/dashboard/monthly-sales${dateParams}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          setReportData((prev) => ({
            ...prev,
            sales: {
              overview: overviewRes.data,
              monthlyData: Array.isArray(salesRes.data) ? salesRes.data : [],
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
              orders: Array.isArray(ordersRes.data?.orders)
                ? ordersRes.data.orders
                : [],
              stats: ordersRes.data?.stats || {
                pending: 0,
                processing: 0,
                shipped: 0,
                delivered: 0,
                completed: 0,
                cancelled: 0,
              },
            },
          }));
          break;
        }
        case "users": {
          const [overviewRes, usersRes] = await Promise.all([
            axios.get(`${baseUrl}/admin/dashboard/overview${dateParams}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${baseUrl}/admin/dashboard/users${dateParams}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          setReportData((prev) => ({
            ...prev,
            users: {
              overview: overviewRes.data,
              users: Array.isArray(usersRes.data?.users)
                ? usersRes.data.users
                : [],
              stats: {
                user: usersRes.data?.stats?.user || 0,
                admin: usersRes.data?.stats?.admin || 0,
                active:
                  usersRes.data?.users?.filter(
                    (user) => user.status === "active"
                  ).length || 0,
                inactive:
                  usersRes.data?.users?.filter(
                    (user) => user.status === "inactive"
                  ).length || 0,
              },
            },
          }));
          break;
        }
        case "inventory": {
          const [overviewRes, booksRes] = await Promise.all([
            axios.get(`${baseUrl}/admin/dashboard/overview${dateParams}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(
              `${baseUrl}/admin/dashboard/top-selling-books${dateParams}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
          ]);
          setReportData((prev) => ({
            ...prev,
            inventory: {
              overview: overviewRes.data,
              books: Array.isArray(booksRes.data?.books)
                ? booksRes.data.books
                : [],
              stats: booksRes.data?.stats || {
                totalBooks: 0,
                outOfStock: 0,
                lowStock: 0,
                inStock: 0,
              },
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

  useEffect(() => {
    if (showReportModal) {
      fetchReportData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReportModal, reportType]);

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

  // Add this function to handle view all books
  const handleViewAllBooks = () => {
    setShowAllTopBooks(!showAllTopBooks);
  };

  const handleViewReport = (type) => {
    setReportType(type);
    setShowReportModal(true);
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
          <h1 className="text-3xl font-bold text-gray-900">Trang tổng quan</h1>
          <p className="text-gray-500 mt-1">
            Chào mừng trở lại! Đây là những gì đang xảy ra với cửa hàng của bạn.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            30 ngày gần đây
          </Button>
          <CustomDialog
            open={showReportModal}
            onOpenChange={setShowReportModal}
            trigger={
              <Button className="gap-2">
                <Eye className="w-4 h-4" />
                Xem báo cáo
              </Button>
            }
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                Báo cáo và phân tích chi tiết
              </div>
            }
            description="Thông tin chi tiết và báo cáo đầy đủ cho doanh nghiệp của bạn"
          >
            <div className="flex flex-col lg:flex-row gap-6 mt-6 flex-1 overflow-hidden">
              {/* Left Sidebar - Report Types */}
              <div className="lg:w-80 space-y-3 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Danh mục báo cáo
                </h3>

                {[
                  {
                    key: "sales",
                    title: "Phân tích doanh thu",
                    description: "Xu hướng doanh thu và hiệu suất",
                    icon: DollarSign,
                    color: "blue",
                    stats: reportData.sales?.overview?.totalSales
                      ? formatCurrency(reportData.sales.overview.totalSales)
                      : formatCurrency(0),
                  },
                  {
                    key: "orders",
                    title: "Quản lý đơn hàng",
                    description: "Thống kê và theo dõi đơn hàng",
                    icon: ShoppingCart,
                    color: "green",
                    stats: reportData.orders?.overview?.totalOrders
                      ? `${reportData.orders.overview.totalOrders} đơn hàng`
                      : "0 đơn hàng",
                  },
                  {
                    key: "users",
                    title: "Thông tin khách hàng",
                    description: "Hành vi và đặc điểm của khách hàng",
                    icon: Users,
                    color: "purple",
                    stats: reportData.users?.overview?.totalUsers
                      ? `${reportData.users.overview.totalUsers} người dùng`
                      : "0 người dùng",
                  },
                  {
                    key: "inventory",
                    title: "Báo cáo kho",
                    description: "Mức tồn kho và hiệu suất sách",
                    icon: BookOpen,
                    color: "orange",
                    stats: reportData.inventory?.overview?.totalBooks
                      ? `${reportData.inventory.overview.totalBooks} sách`
                      : "0 sách",
                  },
                ].map((report) => (
                  <div
                    key={report.key}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      reportType === report.key
                        ? `border-${report.color}-500 bg-${report.color}-50 shadow-lg`
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                    onClick={() => handleViewReport(report.key)}
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
                              "Báo cáo phân tích doanh thu"}
                            {reportType === "orders" &&
                              "Báo cáo quản lý đơn hàng"}
                            {reportType === "users" &&
                              "Báo cáo thông tin khách hàng"}
                            {reportType === "inventory" &&
                              "Báo cáo phân tích kho"}
                          </h3>
                          <p className="text-gray-500 mt-1">
                            {dateRange === "all"
                              ? "Tất cả dữ liệu"
                              : dateRange === "30days"
                              ? "30 ngày qua"
                              : dateRange === "7days"
                              ? "7 ngày qua"
                              : "Dữ liệu hôm nay"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => exportReport(reportType)}
                            className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          >
                            <Download className="w-4 h-4" />
                            Xuất Excel
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
                                        Tổng doanh thu
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
                                        Giá trung bình đơn hàng
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
                                        Tổng đơn hàng
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
                                        Đơn hàng chờ xử lý
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
                                        Đã hoàn thành
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
                                        Đang xử lý
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
                                        Tổng số khách hàng
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
                                        Khách hàng hoạt động
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
                                        Khách hàng mới
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
                                        Tổng số sách
                                      </p>
                                      <p className="text-xl font-bold text-gray-900">
                                        {reportData.inventory.stats
                                          ?.totalBooks || 0}
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
                                        Sách hết hàng
                                      </p>
                                      <p className="text-xl font-bold text-gray-900">
                                        {reportData.inventory.stats
                                          ?.outOfStock || 0}
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
                                        Bán chạy nhất
                                      </p>
                                      <p className="text-xl font-bold text-gray-900">
                                        {reportData.inventory.books?.length ||
                                          0}
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
                            Phân tích xu hướng
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
                              <div className="h-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-4">
                                      Phân bổ trạng thái đơn hàng
                                    </h4>
                                    <div className="space-y-3">
                                      {[
                                        {
                                          status: "pending",
                                          label: "Chờ xác nhận",
                                          color: "yellow",
                                        },
                                        {
                                          status: "processing",
                                          label: "Đang xử lý",
                                          color: "blue",
                                        },
                                        {
                                          status: "shipped",
                                          label: "Đang giao hàng",
                                          color: "purple",
                                        },
                                        {
                                          status: "delivered",
                                          label: "Đã giao hàng",
                                          color: "green",
                                        },
                                        {
                                          status: "completed",
                                          label: "Đã hoàn tất",
                                          color: "emerald",
                                        },
                                        {
                                          status: "cancelled",
                                          label: "Đã hủy",
                                          color: "red",
                                        },
                                      ].map(({ status, label, color }) => {
                                        const count =
                                          reportData.orders?.stats?.[status] ||
                                          0;
                                        const totalOrders = Object.values(
                                          reportData.orders?.stats || {}
                                        ).reduce((a, b) => a + b, 0);
                                        const percentage =
                                          totalOrders > 0
                                            ? (
                                                (count / totalOrders) *
                                                100
                                              ).toFixed(1)
                                            : 0;
                                        return (
                                          <div
                                            key={status}
                                            className="flex items-center justify-between"
                                          >
                                            <div className="flex items-center gap-2">
                                              <div
                                                className={`w-3 h-3 rounded-full bg-${color}-500`}
                                              ></div>
                                              <span className="text-sm text-gray-600">
                                                {label}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium">
                                                {count}
                                              </span>
                                              <span className="text-sm text-gray-500">
                                                ({percentage}%)
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-4">
                                      Phương thức thanh toán
                                    </h4>
                                    <div className="space-y-3">
                                      {[
                                        {
                                          method: "COD",
                                          label: "Thanh toán khi nhận hàng",
                                          color: "blue",
                                        },
                                        {
                                          method: "VNPay",
                                          label: "Chuyển khoản VNPay",
                                          color: "green",
                                        },
                                      ].map(({ method, label, color }) => {
                                        const count =
                                          reportData.orders?.orders?.filter(
                                            (order) =>
                                              order.paymentMethod?.name ===
                                              method
                                          ).length || 0;
                                        const totalOrders =
                                          reportData.orders?.orders?.length ||
                                          0;
                                        const percentage =
                                          totalOrders > 0
                                            ? (
                                                (count / totalOrders) *
                                                100
                                              ).toFixed(1)
                                            : 0;
                                        return (
                                          <div
                                            key={method}
                                            className="flex items-center justify-between"
                                          >
                                            <div className="flex items-center gap-2">
                                              <div
                                                className={`w-3 h-3 rounded-full bg-${color}-500`}
                                              ></div>
                                              <span className="text-sm text-gray-600">
                                                {label}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium">
                                                {count}
                                              </span>
                                              <span className="text-sm text-gray-500">
                                                ({percentage}%)
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {reportType === "users" && (
                              <div className="h-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-4">
                                      Phân bổ vai trò người dùng
                                    </h4>
                                    <div className="space-y-3">
                                      {[
                                        {
                                          role: "user",
                                          label: "Khách hàng",
                                          color: "blue",
                                          count:
                                            reportData.users?.stats?.user || 0,
                                        },
                                        {
                                          role: "admin",
                                          label: "Quản trị viên",
                                          color: "purple",
                                          count:
                                            reportData.users?.stats?.admin || 0,
                                        },
                                      ].map(({ role, label, color, count }) => {
                                        const totalUsers =
                                          (reportData.users?.stats?.user || 0) +
                                          (reportData.users?.stats?.admin || 0);
                                        const percentage =
                                          totalUsers > 0
                                            ? (
                                                (count / totalUsers) *
                                                100
                                              ).toFixed(1)
                                            : 0;
                                        return (
                                          <div
                                            key={role}
                                            className="flex items-center justify-between"
                                          >
                                            <div className="flex items-center gap-2">
                                              <div
                                                className={`w-3 h-3 rounded-full bg-${color}-500`}
                                              ></div>
                                              <span className="text-sm text-gray-600">
                                                {label}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium">
                                                {count}
                                              </span>
                                              <span className="text-sm text-gray-500">
                                                ({percentage}%)
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-4">
                                      Trạng thái tài khoản
                                    </h4>
                                    <div className="space-y-3">
                                      {[
                                        {
                                          status: "active",
                                          label: "Đang hoạt động",
                                          color: "green",
                                          count:
                                            reportData.users?.users?.length ||
                                            0,
                                        },
                                      ].map(
                                        ({ status, label, color, count }) => {
                                          return (
                                            <div
                                              key={status}
                                              className="flex items-center justify-between"
                                            >
                                              <div className="flex items-center gap-2">
                                                <div
                                                  className={`w-3 h-3 rounded-full bg-${color}-500`}
                                                ></div>
                                                <span className="text-sm text-gray-600">
                                                  {label}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                  {count}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                  (100%)
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {reportType === "inventory" && (
                              <div className="h-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-4">
                                      Tình trạng tồn kho
                                    </h4>
                                    <div className="space-y-3">
                                      {[
                                        {
                                          status: "in_stock",
                                          label: "Còn hàng",
                                          color: "green",
                                          getCount: (stats) =>
                                            stats?.inStock || 0,
                                        },
                                        {
                                          status: "low_stock",
                                          label: "Sắp hết hàng",
                                          color: "yellow",
                                          getCount: (stats) =>
                                            stats?.lowStock || 0,
                                        },
                                        {
                                          status: "out_of_stock",
                                          label: "Hết hàng",
                                          color: "red",
                                          getCount: (stats) =>
                                            stats?.outOfStock || 0,
                                        },
                                      ].map(
                                        ({
                                          status,
                                          label,
                                          color,
                                          getCount,
                                        }) => {
                                          const count = getCount(
                                            reportData.inventory?.stats
                                          );
                                          const totalBooks =
                                            reportData.inventory?.stats
                                              ?.totalBooks || 0;
                                          const percentage =
                                            totalBooks > 0
                                              ? (
                                                  (count / totalBooks) *
                                                  100
                                                ).toFixed(1)
                                              : 0;

                                          return (
                                            <div
                                              key={status}
                                              className="flex items-center justify-between"
                                            >
                                              <div className="flex items-center gap-2">
                                                <div
                                                  className={`w-3 h-3 rounded-full bg-${color}-500`}
                                                ></div>
                                                <span className="text-sm text-gray-600">
                                                  {label}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                  {count}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                  ({percentage}%)
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-4">
                                      Danh mục sách
                                    </h4>
                                    <div className="space-y-3">
                                      {data.categoryStats.map((category) => {
                                        const percentage =
                                          data.totalBooks > 0
                                            ? (
                                                (category.count /
                                                  data.totalBooks) *
                                                100
                                              ).toFixed(1)
                                            : 0;
                                        return (
                                          <div
                                            key={category._id}
                                            className="flex items-center justify-between"
                                          >
                                            <span className="text-sm text-gray-600">
                                              {category.name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium">
                                                {category.count}
                                              </span>
                                              <span className="text-sm text-gray-500">
                                                ({percentage}%)
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Detailed Data Table */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h4 className="font-semibold text-gray-900">
                              Phân tích chi tiết
                            </h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  {reportType === "sales" && (
                                    <>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Khoảng thời gian
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Doanh thu
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Đơn hàng
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Đơn hàng trung bình
                                      </th>
                                    </>
                                  )}
                                  {reportType === "orders" && (
                                    <>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Mã đơn hàng
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Khách hàng
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Trạng thái
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tổng
                                      </th>
                                    </>
                                  )}
                                  {reportType === "users" && (
                                    <>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Khách hàng
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Đơn hàng
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tổng chi tiêu
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Đơn hàng cuối cùng
                                      </th>
                                    </>
                                  )}
                                  {reportType === "inventory" && (
                                    <>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Sách
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tồn kho
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Đã bán
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Doanh thu
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

      {/* AI Business Assistant */}
      <EnhancedAIBusinessAssistant
        businessInsights={businessInsights}
        insightsLoading={insightsLoading}
        onRefresh={refetchInsights}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng số sách</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data.totalBooks.toLocaleString()}
              </p>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">
                  {data.trendingBooks > 0 ? "+" : ""}
                  {data.trendingBooks}%
                </span>
                <span className="text-gray-500 ml-1">so với tháng trước</span>
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
              <p className="text-sm font-medium text-gray-500">
                Tổng doanh thu
              </p>
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
                <span className="text-gray-500 ml-1">so với tháng trước</span>
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
              <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
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
                <span className="text-gray-500 ml-1">so với tháng trước</span>
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
              <p className="text-sm font-medium text-gray-500">
                Tổng số khách hàng
              </p>
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
          <RevenueChart
            data={data.monthlySales}
            dateRange={chartDateRange}
            onDateRangeChange={setChartDateRange}
          />
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Đơn hàng gần đây
              </h3>
              <Badge variant="secondary">
                {data.recentOrders?.length || 0}
              </Badge>
            </div>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-6 space-y-4">
              {data.recentOrders?.map((order) => {
                const userName = order.user?.fullName || "Khách hàng";
                const userInitial = userName.charAt(0);
                const userAvatar = order.user?.photoURL;

                return (
                  <div
                    key={order._id}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={userAvatar || "/placeholder.svg"}
                        alt={userName}
                      />
                      <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {userName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.createdAt
                          ? format(new Date(order.createdAt), "MMM dd, HH:mm")
                          : "N/A"}
                      </p>
                      <Badge
                        className={`text-xs mt-1 ${getStatusColor(
                          order.status
                        )}`}
                        variant="secondary"
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">
                          {order.status || "pending"}
                        </span>
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalPrice || 0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.productIds?.length || 0} items
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Top Selling Books */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Sách bán chạy
            </h3>
            <Button variant="outline" size="sm" onClick={handleViewAllBooks}>
              {showAllTopBooks ? "Thu gọn" : "Xem tất cả"}
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.topSellingBooks
              ?.slice()
              .sort((a, b) => b.totalSold - a.totalSold)
              .slice(0, showAllTopBooks ? undefined : 4)
              .map((book, index) => (
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
