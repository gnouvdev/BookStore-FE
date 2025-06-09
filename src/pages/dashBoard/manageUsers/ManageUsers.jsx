/* eslint-disable no-unused-vars */
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { toast } from "react-hot-toast";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  UserPlus,
  Users,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  SortAsc,
  SortDesc,
  User,
  Crown,
} from "lucide-react";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/redux/features/users/userApi";
import * as XLSX from "xlsx";

const EnhancedManageUsers = () => {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const tableRef = useRef(null);

  // RTK Query hooks
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useGetUsersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  // Debug logs
  useEffect(() => {
    console.log("Users Data:", usersData);
    console.log("Loading:", isLoading);
    console.log("Error:", error);
  }, [usersData, isLoading, error]);

  // State management
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for add/edit user
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "customer",
    status: "active",
  });

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
    if (!usersData) {
      console.log("No users data available");
      setFilteredUsers([]);
      return;
    }

    console.log("Processing users:", usersData);
    let filtered = [...usersData];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          `${user.firstName || ""} ${user.lastName || ""}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (user.email || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (user._id || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((user) => user.status === selectedStatus);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "name") {
        aValue = `${a.firstName || ""} ${a.lastName || ""}`;
        bValue = `${b.firstName || ""} ${b.lastName || ""}`;
      }

      if (
        sortBy === "createdAt" ||
        sortBy === "updatedAt" ||
        sortBy === "lastLogin"
      ) {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    console.log("Filtered users:", filtered);
    setFilteredUsers(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [
    usersData,
    searchQuery,
    selectedRole,
    selectedStatus,
    sortBy,
    sortOrder,
    itemsPerPage,
  ]);

  // Show error message if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error.data?.message || "Failed to fetch users");
    }
  }, [error]);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Status update handler
  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      await updateUser({ id: userId, status: newStatus }).unwrap();
      toast.success("Trạng thái người dùng đã được cập nhật thành công");
    } catch (err) {
      toast.error(
        err.data?.message || "Không thể cập nhật trạng thái người dùng"
      );
    }
  };

  // Role update handler
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await updateUser({ id: userId, role: newRole }).unwrap();
      toast.success("Vai trò người dùng đã được cập nhật thành công");
    } catch (err) {
      toast.error(err.data?.message || "Không thể cập nhật vai trò người dùng");
    }
  };

  // Delete user handler
  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId).unwrap();
      setShowDeleteModal(false);
      toast.success("Xóa người dùng thành công");
    } catch (err) {
      toast.error(err.data?.message || "Không thể xóa người dùng");
    }
  };

  // Add user handler
  const handleAddUser = async (userData) => {
    try {
      await updateUser(userData).unwrap();
      setShowAddModal(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "customer",
        status: "active",
      });
      toast.success("Thêm người dùng thành công");
    } catch (err) {
      toast.error(err.data?.message || "Không thể thêm người dùng");
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    refetch();
    toast.success("Cập nhật người dùng thành công");
  };

  // Get status styling
  const getStatusStyling = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "banned":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get role styling
  const getRoleStyling = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "moderator":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "customer":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3" />;
      case "moderator":
        return <Shield className="h-3 w-3" />;
      case "customer":
        return <User className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3" />;
      case "inactive":
        return <Clock className="h-3 w-3" />;
      case "banned":
        return <Ban className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  // Format price to VNĐ
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Custom Components (same as in manage-orders)
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

  const Input = ({ className = "", ...props }) => (
    <input
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${className}`}
      {...props}
    />
  );

  const Select = ({ children, value, onChange, className = "" }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white ${className}`}
    >
      {children}
    </select>
  );

  const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
    const sizes = {
      sm: "max-w-md",
      md: "max-w-2xl",
      lg: "max-w-4xl",
      xl: "max-w-6xl",
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={onClose}
            aria-hidden="true"
          ></div>

          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`inline-block w-full ${sizes[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-[101]`}
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
            Hiển thị từ {(currentPage - 1) * itemsPerPage + 1} đến{" "}
            {Math.min(currentPage * itemsPerPage, filteredUsers.length)} của{" "}
            {filteredUsers.length} kết quả
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
          <span className="text-sm text-gray-600">trang</span>
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

  // Export users function
  const handleExportUsers = () => {
    try {
      // Prepare data for export
      const exportData = filteredUsers.map((user) => ({
        ID: user._id,
        "Họ và tên": user.fullName,
        Email: user.email,
        "Số điện thoại": user.phone || "N/A",
        "Vai trò": user.role,
        "Trạng thái": user.status,
        "Số đơn hàng": user.orders?.length || 0,
        "Tổng tiền đã mua": formatPrice(user.totalSpent || 0),
        "Ngày tham gia": new Date(user.createdAt).toLocaleDateString("vi-VN"),
        "Lần đăng nhập cuối": user.lastLogin
          ? new Date(user.lastLogin).toLocaleDateString("vi-VN")
          : "N/A",
        "Xác thực email": user.isEmailVerified
          ? "Đã xác thực"
          : "Chưa xác thực",
        "Xác thực số điện thoại": user.isPhoneVerified
          ? "Đã xác thực"
          : "Chưa xác thực",
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Người dùng");

      // Generate Excel file
      XLSX.writeFile(
        wb,
        `users-${new Date().toISOString().split("T")[0]}.xlsx`
      );
      toast.success("Xuất dữ liệu người dùng thành công!");
    } catch (error) {
      console.error("Error exporting users:", error);
      toast.error("Không thể xuất dữ liệu người dùng");
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
    >
      {/* Header Section */}
      <div
        ref={headerRef}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản lý tài khoản người dùng
                </h1>
                <p className="text-gray-600">
                  Quản lý tài khoản người dùng và quyền hạn
                </p>
              </div>
            </div>

            {/* Filters and Search */}
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
                Làm mới
              </Button>
              <Button
                onClick={handleExportUsers}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Xuất Excel
              </Button>
              <Button onClick={() => setShowAddModal(true)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Thêm người dùng
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mt-6 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm người dùng theo tên, email hoặc ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/70 backdrop-blur-sm"
              />
            </div>

            <div className="flex gap-3">
              <Select
                value={selectedRole}
                onChange={setSelectedRole}
                className="w-40 bg-white/70 backdrop-blur-sm"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="customer">Khách hàng</option>
                <option value="admin">Quản trị viên</option>
                <option value="moderator">Moderator</option>
              </Select>

              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                className="w-40 bg-white/70 backdrop-blur-sm"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="banned">Bị khóa</option>
                <option value="pending">Chờ xác thực</option>
              </Select>

              <Select
                value={sortBy}
                onChange={setSortBy}
                className="w-32 bg-white/70 backdrop-blur-sm"
              >
                <option value="createdAt">Ngày</option>
                <option value="name">Tên</option>
                <option value="totalSpent">Số tiền</option>
                <option value="totalOrders">Đơn hàng</option>
                <option value="lastLogin">Đăng nhập cuối</option>
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
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Đang tải dữ liệu...</span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-8 text-center">
              <p className="text-red-500">Không thể tải dữ liệu</p>
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Data Display */}
          {!isLoading && !error && (
            <>
              {/* Stats Bar */}
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Tổng số người dùng
                      </p>
                      <p className="font-semibold">{filteredUsers.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Người dùng hoạt động
                      </p>
                      <p className="font-semibold">
                        {
                          filteredUsers.filter((u) => u.status === "active")
                            .length
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Crown className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quản trị viên</p>
                      <p className="font-semibold">
                        {filteredUsers.filter((u) => u.role === "admin").length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Chờ xác thực</p>
                      <p className="font-semibold">
                        {
                          filteredUsers.filter((u) => u.status === "pending")
                            .length
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Ban className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bị khóa</p>
                      <p className="font-semibold">
                        {
                          filteredUsers.filter((u) => u.status === "banned")
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
                        Người dùng
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Liên hệ
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hoạt động
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tham gia
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <AnimatePresence mode="wait">
                      {getCurrentPageItems().map((user, index) => (
                        <motion.tr
                          key={user._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                                {user.fullName?.charAt(0) || "?"}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {user.fullName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-900">
                                  {user.email}
                                </span>
                                {user.isEmailVerified && (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-900">
                                  {user.phone || "N/A"}
                                </span>
                                {user.isPhoneVerified && (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleStyling(
                                user.role
                              )}`}
                            >
                              {getRoleIcon(user.role)}
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyling(
                                user.status
                              )}`}
                            >
                              {getStatusIcon(user.status)}
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-900">
                                {user.orders?.length || 0} đơn hàng
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatPrice(user.totalSpent || 0)} tiền đã mua
                              </p>
                              <p className="text-xs text-gray-400">
                                Lần cuối:{" "}
                                {user.lastLogin
                                  ? new Date(
                                      user.lastLogin
                                    ).toLocaleDateString()
                                  : "Không bao giờ"}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-900">
                                {user.createdAt
                                  ? new Date(
                                      user.createdAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDetailsModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedUser(user);
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
            </>
          )}
        </div>
      </div>

      {/* Enhanced User Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Chi tiết người dùng - ${selectedUser?.fullName}`}
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            {/* User Header */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {selectedUser.fullName?.charAt(0) || "?"}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedUser.fullName}
                </h2>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleStyling(
                      selectedUser.role
                    )}`}
                  >
                    {getRoleIcon(selectedUser.role)}
                    {selectedUser.role}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyling(
                      selectedUser.status
                    )}`}
                  >
                    {getStatusIcon(selectedUser.status)}
                    {selectedUser.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Personal Information */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Thông tin cá nhân
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Họ và tên
                        </label>
                        <p className="text-sm text-gray-900 font-medium">
                          {selectedUser.fullName}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Email
                        </label>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-900">
                            {selectedUser.email}
                          </p>
                          {selectedUser.isEmailVerified && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Số điện thoại
                        </label>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-900">
                            {selectedUser.phone || "Chưa cập nhật"}
                          </p>
                          {selectedUser.isPhoneVerified && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          ID người dùng
                        </label>
                        <p className="text-xs text-gray-900 font-mono">
                          {selectedUser._id}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Ngày tham gia
                        </label>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedUser.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Cập nhật cuối
                        </label>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedUser.updatedAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    Địa chỉ
                  </h3>
                  {selectedUser.address ? (
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-900">
                        {selectedUser.address.street || "Chưa cập nhật"}
                      </p>
                      <p className="text-gray-600">
                        {selectedUser.address.city || "Chưa cập nhật"},{" "}
                        {selectedUser.address.state || "Chưa cập nhật"}{" "}
                        {selectedUser.address.zipcode || ""}
                      </p>
                      <p className="text-gray-600">
                        {selectedUser.address.country || "Chưa cập nhật"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Chưa có thông tin địa chỉ
                    </p>
                  )}
                </div>
              </div>

              {/* Statistics & Actions */}
              <div className="space-y-4">
                {/* Account Statistics */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    Thống kê tài khoản
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Tổng đơn hàng
                      </span>
                      <span className="font-medium text-blue-600">
                        {selectedUser.orders ? selectedUser.orders.length : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Tổng tiền đã mua
                      </span>
                      <span className="font-medium text-green-600">
                        {selectedUser.totalSpent
                          ? formatPrice(selectedUser.totalSpent)
                          : "0 ₫"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Đơn hàng gần nhất
                      </span>
                      <span className="text-xs text-gray-900">
                        {selectedUser.orders && selectedUser.orders.length > 0
                          ? new Date(
                              Math.max(
                                ...selectedUser.orders.map(
                                  (order) => new Date(order.createdAt)
                                )
                              )
                            ).toLocaleDateString("vi-VN")
                          : "Chưa có đơn hàng"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Trạng thái xác thực
                      </span>
                      <div className="flex gap-1">
                        {selectedUser.isEmailVerified && (
                          <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                            Email ✓
                          </span>
                        )}
                        {selectedUser.isPhoneVerified && (
                          <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                            Phone ✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">
                    Hành động nhanh
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() =>
                        handleStatusUpdate(
                          selectedUser._id,
                          selectedUser.status === "active"
                            ? "inactive"
                            : "active"
                        )
                      }
                      disabled={isLoading}
                    >
                      {selectedUser.status === "active" ? (
                        <>
                          <XCircle className="h-3 w-3" />
                          Tạm dừng tài khoản
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Kích hoạt tài khoản
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() =>
                        handleRoleUpdate(
                          selectedUser._id,
                          selectedUser.role === "admin" ? "customer" : "admin"
                        )
                      }
                      disabled={isLoading}
                    >
                      <Crown className="h-3 w-3" />
                      {selectedUser.role === "admin"
                        ? "Loại bỏ quyền admin"
                        : "Cấp quyền admin"}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() =>
                        handleStatusUpdate(selectedUser._id, "banned")
                      }
                      disabled={isLoading || selectedUser.status === "banned"}
                    >
                      <Ban className="h-3 w-3" />
                      Khóa tài khoản
                    </Button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Hoạt động gần đây
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái:</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyling(
                          selectedUser.status
                        )}`}
                      >
                        {getStatusIcon(selectedUser.status)}
                        {selectedUser.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vai trò:</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleStyling(
                          selectedUser.role
                        )}`}
                      >
                        {getRoleIcon(selectedUser.role)}
                        {selectedUser.role}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đăng nhập cuối:</span>
                      <span className="text-gray-900">
                        {selectedUser.lastLogin
                          ? new Date(selectedUser.lastLogin).toLocaleString(
                              "vi-VN"
                            )
                          : "Chưa bao giờ"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cập nhật cuối:</span>
                      <span className="text-gray-900">
                        {new Date(selectedUser.updatedAt).toLocaleString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tham gia:</span>
                      <span className="text-gray-900">
                        {new Date(selectedUser.createdAt).toLocaleString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            role: "customer",
            status: "active",
          });
        }}
        title={showAddModal ? "Thêm người dùng mới" : "Chỉnh sửa người dùng"}
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (showAddModal) {
              handleAddUser(formData);
            } else {
              // Handle edit user logic here
              setShowEditModal(false);
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vai trò
              </label>
              <Select
                value={formData.role}
                onChange={(value) => setFormData({ ...formData, role: value })}
              >
                <option value="customer">Khách hàng</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Quản trị viên</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <Select
                value={formData.status}
                onChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="pending">Chờ xác thực</option>
                <option value="banned">Bị khóa</option>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  role: "customer",
                  status: "active",
                });
              }}
            >
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Đang lưu..."
                : showAddModal
                ? "Thêm người dùng"
                : "Cập nhật người dùng"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xóa người dùng"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xóa người dùng{" "}
              <strong>{selectedUser.fullName}</strong>? Hành động này không thể
              hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteUser(selectedUser._id)}
                disabled={isLoading}
              >
                {isLoading ? "Đang xóa..." : "Xóa người dùng"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EnhancedManageUsers;
