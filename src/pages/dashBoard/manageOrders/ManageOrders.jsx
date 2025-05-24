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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock data for demonstration
const generateMockOrders = (count = 100) => {
  const statuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "completed",
  ];
  const paymentMethods = [
    "Credit Card",
    "PayPal",
    "Bank Transfer",
    "Cash on Delivery",
  ];
  const firstNames = [
    "John",
    "Jane",
    "Robert",
    "Emily",
    "Michael",
    "Sarah",
    "David",
    "Lisa",
    "Alex",
    "Maria",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Wilson",
    "Moore",
  ];
  const cities = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose",
  ];

  return Array.from({ length: count }, (_, i) => ({
    _id: `ORD-${String(i + 1).padStart(4, "0")}`,
    name: `${firstNames[i % firstNames.length]} ${
      lastNames[i % lastNames.length]
    }`,
    email: `customer${i + 1}@example.com`,
    phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    totalPrice: Math.floor(Math.random() * 500) + 50,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    paymentMethod: {
      name: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      last4: String(Math.floor(Math.random() * 9000) + 1000),
    },
    address: {
      street: `${Math.floor(Math.random() * 9999) + 1} Main St`,
      city: cities[i % cities.length],
      state: "CA",
      country: "USA",
      zipcode: String(Math.floor(Math.random() * 90000) + 10000),
    },
    productIds: Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      (_, j) => ({
        productId: {
          _id: `book-${j + 1}`,
          title: `Book Title ${j + 1}`,
          price: Math.floor(Math.random() * 50) + 10,
          image: `/placeholder.svg?height=60&width=40`,
        },
        quantity: Math.floor(Math.random() * 3) + 1,
      })
    ),
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 5000000000).toISOString(),
    trackingNumber: `TRK${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`,
  }));
};

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
                              setShowStatusModal(true);
                            }}
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
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Order Details - ${selectedOrder?._id}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{selectedOrder.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{selectedOrder.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{selectedOrder.phone}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p>{selectedOrder.address.street}</p>
                    <p>
                      {selectedOrder.address.city},{" "}
                      {selectedOrder.address.state}{" "}
                      {selectedOrder.address.zipcode}
                    </p>
                    <p>{selectedOrder.address.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Order Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">{selectedOrder._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking Number:</span>
                  <span className="font-medium">
                    {selectedOrder.trackingNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyling(
                      selectedOrder.status
                    )}`}
                  >
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">
                    {selectedOrder.paymentMethod?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-lg">
                    ${selectedOrder.totalPrice}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span>
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-semibold text-lg">Products</h3>
              <div className="space-y-3">
                {selectedOrder.productIds.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={item.productId.image || "/placeholder.svg"}
                      alt={item.productId.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productId.title}</h4>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.productId.price}</p>
                      <p className="text-sm text-gray-600">
                        Total: ${item.productId.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

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
