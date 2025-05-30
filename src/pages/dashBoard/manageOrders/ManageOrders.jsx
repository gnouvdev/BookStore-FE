/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} from "@/redux/features/orders/ordersApi";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  Mail,
  CreditCard,
  ShoppingBag,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Download,
  SortAsc,
  SortDesc,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CustomDialog from "@/components/ui/custom-dialog";

// Mock data for demonstration

const EnhancedManageOrders = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const tableRef = useRef(null);

  // RTK Query hooks
  const { data: ordersData = [], isLoading, error } = useGetAllOrdersQuery();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  // Debug logs
  useEffect(() => {
    console.log("Orders Data:", ordersData);
    console.log("Loading:", isLoading);
    console.log("Error:", error);
  }, [ordersData, isLoading, error]);

  // State management
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Initialize animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );

      gsap.fromTo(
        tableRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Filter and search logic
  useEffect(() => {
    // Ensure ordersData is an array and has the correct structure
    const orders = Array.isArray(ordersData?.orders)
      ? ordersData.orders
      : Array.isArray(ordersData)
      ? ordersData
      : [];

    console.log("Processing orders:", orders);
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order?._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order?.trackingNumber
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((order) => order?.status === selectedStatus);
    }

    // Payment method filter
    if (selectedPayment !== "all") {
      filtered = filtered.filter(
        (order) => order?.paymentMethod?.name === selectedPayment
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a?.[sortBy];
      let bValue = b?.[sortBy];

      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue || "")
          : (bValue || "").localeCompare(aValue);
      }

      return sortOrder === "asc"
        ? (aValue || 0) - (bValue || 0)
        : (bValue || 0) - (aValue || 0);
    });

    console.log("Filtered orders:", filtered);
    setFilteredOrders(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [
    ordersData,
    searchQuery,
    selectedStatus,
    selectedPayment,
    sortBy,
    sortOrder,
    itemsPerPage,
  ]);

  // Get unique payment methods
  const paymentMethods = useMemo(() => {
    const orders = Array.isArray(ordersData?.orders)
      ? ordersData.orders
      : Array.isArray(ordersData)
      ? ordersData
      : [];
    return [
      ...new Set(
        orders.map((order) => order?.paymentMethod?.name).filter(Boolean)
      ),
    ];
  }, [ordersData]);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Status update handler
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({ id: orderId, status: newStatus }).unwrap();
      toast.success(`Order status updated to ${newStatus} successfully`);
      setShowStatusModal(false);
    } catch (err) {
      toast.error(err.data?.message || "Failed to update order status");
    }
  };

  // Delete order handler
  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteOrder(orderId).unwrap();
      setShowDeleteModal(false);
      toast.success("Order deleted successfully");
    } catch (err) {
      toast.error(err.data?.message || "Failed to delete order");
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    // RTK Query will automatically refetch the data
    toast.success("Orders refreshed successfully");
  };

  // Format price to VNĐ
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Get status badge styling
  const getStatusStyling = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "processing":
        return <Package className="h-3 w-3" />;
      case "shipped":
        return <Truck className="h-3 w-3" />;
      case "delivered":
        return <CheckCircle className="h-3 w-3" />;
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "cancelled":
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  // Custom Button Component
  const Button = ({
    children,
    onClick,
    disabled,
    variant = "default",
    size = "md",
    className = "",
    ...props
  }) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
      default:
        "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 focus:ring-orange-500",
      outline:
        "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
      ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
      destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      icon: "p-2",
    };

    return (
      <button
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  };

  // Custom Input Component
  const Input = ({ className = "", ...props }) => (
    <input
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${className}`}
      {...props}
    />
  );

  // Custom Select Component
  const Select = ({ children, value, onChange, className = "" }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white ${className}`}
    >
      {children}
    </select>
  );

  // Custom Modal Component
  const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
    const sizes = {
      sm: "max-w-md",
      md: "max-w-2xl",
      lg: "max-w-4xl",
      xl: "max-w-6xl",
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            aria-hidden="true"
          ></div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`inline-block w-full ${sizes[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      </div>
    );
  };

  // Pagination component
  const PaginationControls = () => {
    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{" "}
            {filteredOrders.length} results
          </span>
          <Select
            value={itemsPerPage.toString()}
            onChange={(value) => setItemsPerPage(Number.parseInt(value))}
            className="w-20"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </Select>
          <span className="text-sm text-gray-600">per page</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? "default" : "outline"}
              size="icon"
              onClick={() => typeof page === "number" && handlePageChange(page)}
              disabled={page === "..."}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-100"
    >
      {/* Header Section */}
      <div
        ref={headerRef}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-white">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Manage Orders
                </h1>
                <p className="text-gray-600">
                  Track and manage customer orders
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mt-6 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders by ID, customer name, email, or tracking number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/70 backdrop-blur-sm"
              />
            </div>

            <div className="flex gap-3">
              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                className="w-40 bg-white/70 backdrop-blur-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>

              <Select
                value={selectedPayment}
                onChange={setSelectedPayment}
                className="w-40 bg-white/70 backdrop-blur-sm"
              >
                <option value="all">All Payments</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </Select>

              <Select
                value={sortBy}
                onChange={setSortBy}
                className="w-32 bg-white/70 backdrop-blur-sm"
              >
                <option value="createdAt">Date</option>
                <option value="totalPrice">Amount</option>
                <option value="name">Customer</option>
                <option value="status">Status</option>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="bg-white/70 backdrop-blur-sm"
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div
          ref={tableRef}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          {/* Stats Bar */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingBag className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="font-semibold">{filteredOrders.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="font-semibold">
                    {formatPrice(
                      filteredOrders.reduce((acc, o) => acc + o.totalPrice, 0)
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="font-semibold">
                    {
                      filteredOrders.filter((o) => o.status === "pending")
                        .length
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="font-semibold">
                    {
                      filteredOrders.filter((o) => o.status === "completed")
                        .length
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="font-semibold">
                    {
                      filteredOrders.filter((o) => o.status === "cancelled")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence mode="wait">
                  {getCurrentPageItems().map((order, index) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order._id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.productIds.length} items
                          </p>
                          <p className="text-xs text-gray-400">
                            {order.trackingNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {order.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {formatPrice(order.totalPrice)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-900">
                              {order.paymentMethod?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ****{order.paymentMethod?.last4}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyling(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailsModal(true);
                            }}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowStatusModal(true);
                            }}
                            title="Cập nhật trạng thái"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDeleteModal(true);
                            }}
                            title="Xóa đơn hàng"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <PaginationControls />
        </div>
      </div>

      {/* Order Details Modal */}
      <CustomDialog
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        title={
          <div className="flex items-center gap-3 px-6">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Chi tiết đơn hàng
              </h2>
              <div className="flex items-center gap-2 text-orange-700 mb-6">
                <span>Mã đơn hàng:</span>
                <span className="font-medium">{selectedOrder?._id}</span>
              </div>
            </div>
          </div>
        }
        description={
          <div className="flex items-center justify-between px-6">
            <span className="text-orange-700">Trạng thái:</span>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyling(
                selectedOrder?.status
              )}`}
            >
              {getStatusIcon(selectedOrder?.status)}
              <span className="capitalize">{selectedOrder?.status}</span>
            </span>
          </div>
        }
        className="p-0"
      >
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
              {/* Header content moved to title prop */}
            </div>

            <div className="p-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                      <p className="font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleDateString(
                          "vi-VN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Phương thức thanh toán
                      </p>
                      <p className="font-medium">
                        {selectedOrder.paymentMethod?.name}
                        {selectedOrder.paymentMethod?.last4 && (
                          <span className="text-sm text-gray-500 ml-2">
                            ****{selectedOrder.paymentMethod?.last4}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tổng thanh toán</p>
                      <p className="font-medium text-lg">
                        {formatPrice(selectedOrder.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Information */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-500" />
                        Thông tin khách hàng
                      </h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {selectedOrder.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedOrder.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedOrder.email}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{selectedOrder.phone}</span>
                        </div>
                        <div className="flex items-start gap-3 p-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                          <div>
                            <p className="font-medium">
                              {selectedOrder.address.street}
                            </p>
                            <p className="text-gray-600">
                              {selectedOrder.address.city},{" "}
                              {selectedOrder.address.state}{" "}
                              {selectedOrder.address.zipcode}
                            </p>
                            <p className="text-gray-600">
                              {selectedOrder.address.country}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Information */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-gray-500" />
                        Thông tin vận chuyển
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Mã theo dõi:</span>
                        <span className="font-medium bg-gray-100 px-3 py-1 rounded-full text-sm">
                          {selectedOrder.trackingNumber}
                        </span>
                      </div>

                      {/* Order Timeline */}
                      <div className="mt-4 space-y-4">
                        <div className="relative pl-8 pb-4 border-l-2 border-green-500">
                          <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-green-500"></div>
                          <p className="font-medium">Đơn hàng đã đặt</p>
                          <p className="text-sm text-gray-500">
                            {new Date(
                              selectedOrder.createdAt
                            ).toLocaleDateString("vi-VN")}
                          </p>
                        </div>

                        {selectedOrder.status !== "pending" && (
                          <div className="relative pl-8 pb-4 border-l-2 border-blue-500">
                            <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                            <p className="font-medium">Đang xử lý</p>
                            <p className="text-sm text-gray-500">
                              {new Date(
                                new Date(selectedOrder.createdAt).getTime() +
                                  86400000
                              ).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        )}

                        {(selectedOrder.status === "shipped" ||
                          selectedOrder.status === "delivered" ||
                          selectedOrder.status === "completed") && (
                          <div className="relative pl-8 pb-4 border-l-2 border-purple-500">
                            <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-purple-500"></div>
                            <p className="font-medium">
                              Đã giao cho đơn vị vận chuyển
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(
                                new Date(selectedOrder.createdAt).getTime() +
                                  172800000
                              ).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        )}

                        {(selectedOrder.status === "delivered" ||
                          selectedOrder.status === "completed") && (
                          <div className="relative pl-8 border-l-2 border-green-500">
                            <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-green-500"></div>
                            <p className="font-medium">Đã giao hàng</p>
                            <p className="text-sm text-gray-500">
                              {new Date(
                                new Date(selectedOrder.createdAt).getTime() +
                                  432000000
                              ).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        )}

                        {selectedOrder.status === "cancelled" && (
                          <div className="relative pl-8 border-l-2 border-red-500">
                            <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-red-500"></div>
                            <p className="font-medium">Đã hủy</p>
                            <p className="text-sm text-gray-500">
                              {new Date(
                                selectedOrder.updatedAt
                              ).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-gray-500" />
                        Sản phẩm ({selectedOrder.productIds.length})
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {selectedOrder.productIds.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="relative">
                            <img
                              src={
                                item.productId.coverImage ||
                                item.productId.image ||
                                "/placeholder.svg"
                              }
                              alt={item.productId.title}
                              className="w-16 h-20 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder.svg";
                              }}
                            />
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {item.productId.title}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Đơn giá:{" "}
                              {formatPrice(
                                item.productId.price?.newPrice ||
                                  item.productId.price?.oldPrice ||
                                  item.productId.price ||
                                  0
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              Số lượng: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {formatPrice(
                                (item.productId.price?.newPrice ||
                                  item.productId.price?.oldPrice ||
                                  item.productId.price ||
                                  0) * item.quantity
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 p-4 border-t border-gray-200">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tạm tính:</span>
                          <span>
                            {formatPrice(selectedOrder.totalPrice * 0.9)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Thuế (10%):</span>
                          <span>
                            {formatPrice(selectedOrder.totalPrice * 0.1)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Phí vận chuyển:</span>
                          <span className="text-green-600">Miễn phí</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex justify-between font-medium">
                            <span>Tổng cộng:</span>
                            <span className="text-lg">
                              {formatPrice(selectedOrder.totalPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Actions */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-800">
                        Ghi chú & Thao tác
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 italic">
                          {selectedOrder.notes ||
                            "Không có ghi chú cho đơn hàng này."}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            setShowDetailsModal(false);
                            setSelectedOrder(selectedOrder);
                            setShowStatusModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                          Cập nhật trạng thái
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="w-4 h-4" />
                          Xuất hóa đơn
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setShowDetailsModal(false);
                            setSelectedOrder(selectedOrder);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa đơn hàng
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Đóng
                </Button>
                <Button className="gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                  <Truck className="w-4 h-4" />
                  Cập nhật vận chuyển
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </CustomDialog>

      {/* Status Update Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update status for order {selectedOrder?._id}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  "pending",
                  "processing",
                  "shipped",
                  "delivered",
                  "completed",
                  "cancelled",
                ].map((status) => (
                  <Button
                    key={status}
                    variant={
                      selectedOrder.status === status ? "default" : "outline"
                    }
                    onClick={() =>
                      handleStatusUpdate(selectedOrder._id, status)
                    }
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {getStatusIcon(status)}
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete order {selectedOrder?._id}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteOrder(selectedOrder?._id)}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedManageOrders;
