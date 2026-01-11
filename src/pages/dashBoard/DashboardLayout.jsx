/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  Users,
  ShoppingCart,
  MessageCircle,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Plus,
  BarChart3,
  Package,
  UserCheck,
  Bookmark,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ImprovedDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(3);
  const location = useLocation();
  const navigate = useNavigate();

  // Get user data from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const user = {
    name: storedUser.fullName || storedUser.displayName || storedUser.name || "Admin",
    role: storedUser.role || "Admin",
    avatar: storedUser.photoURL || storedUser.avatar || "https://hoathinh4k3.top/wp-content/uploads/2025/01/007xgN06gy1hxj7l2rmqwj31o12yo4Q-1.jpg",
    email: storedUser.email || "admin@bookstore.com",
  };

  const menuItems = [
    {
      title: "Tổng quan",
      icon: LayoutDashboard,
      path: "/dashboard",
      badge: null,
    },
    {
      title: "Thêm sách",
      icon: Plus,
      path: "/dashboard/add-new-book",
      badge: null,
    },
    {
      title: "Quản lý sách",
      icon: BookOpen,
      path: "/dashboard/manage-books",
      badge: null,
    },
    {
      title: "Quản lý thể loại",
      icon: Bookmark,
      path: "/dashboard/manage-categories",
      badge: null,
    },
    {
      title: "Quản lý tác giả",
      icon: UserCheck,
      path: "/dashboard/manage-authors",
      badge: null,
    },
    {
      title: "Quản lý người dùng",
      icon: Users,
      path: "/dashboard/manage-users",
      badge: null,
    },
    {
      title: "Quản lý đơn hàng",
      icon: ShoppingCart,
      path: "/dashboard/manage-orders",
      badge: "12",
    },
    {
      title: "Chat",
      icon: MessageCircle,
      path: "/dashboard/chat",
      badge: "5",
    },
    {
      title: "Mã giảm giá",
      icon: Ticket,
      path: "/dashboard/manage-voucher",
      badge: null,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Check authentication on mount and route change
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserStr = localStorage.getItem("user");
    
    if (!token || !storedUserStr) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/admin");
      return;
    }

    try {
      const user = JSON.parse(storedUserStr);
      if (user.role !== "admin") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/admin");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/admin");
    }
  }, [location.pathname, navigate]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <>
            {/* Overlay for mobile */}
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-200 shadow-lg flex flex-col"
            >
              {/* Logo */}
              <div className="flex-none flex items-center justify-between h-16 px-6 border-b border-gray-200">
                <Link to="/" className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    BookStore
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group bg-white shadow-sm border ${
                        active
                          ? "border-blue-500 bg-white text-blue-600 shadow-md"
                          : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={`w-5 h-5 ${
                            active
                              ? "text-blue-500"
                              : "text-gray-400 group-hover:text-blue-500"
                          }`}
                        />
                        <span className="font-medium">{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge
                          variant={active ? "secondary" : "default"}
                          className={`text-xs ${
                            active
                              ? "bg-blue-100 text-blue-600 border-blue-200"
                              : "bg-blue-100 text-blue-600 border-blue-200"
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* User Profile */}
              <div className="flex-none p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
                  <Avatar className="w-10 h-10 border-2 border-blue-100">
                    <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      {user.role}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full mt-3 justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 bg-white border border-gray-200 shadow-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </Button>
              </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 md:ml-[280px]">
              {/* Header */}
              <header className="sticky top-0 right-0 left-0 md:left-[280px] bg-white border-b border-gray-200 shadow-sm z-40">
                <div className="flex items-center justify-between h-16 px-6">
                  {/* Left side */}
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setSidebarOpen(true)}
                    >
                      <Menu className="w-5 h-5" />
                    </Button>

                    {/* Search */}
                    {/* <div className="hidden sm:block relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64 bg-gray-50 border-gray-200 focus:bg-white"
                      />
                    </div> */}
                  </div>

                  {/* Right side */}
                  <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="w-5 h-5" />
                      {notifications > 0 && (
                        <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                          {notifications}
                        </Badge>
                      )}
                    </Button>

                    {/* User Menu */}
                    <div className="flex items-center space-x-3">
                      <div className="hidden md:block text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                        />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </header>

              {/* Page Content */}
              <main className="flex-1 overflow-x-auto bg-gray-50">
                <div className="min-w-full px-6 py-4">
                  <Outlet />
                </div>
              </main>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImprovedDashboardLayout;
