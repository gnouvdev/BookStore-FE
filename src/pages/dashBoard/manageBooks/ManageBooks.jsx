/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Star,
  TrendingUp,
  Package,
  DollarSign,
  User,
  Tag,
  BookOpen,
  Grid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import baseUrl from "../../../utils/baseURL";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const EnhancedManageBooks = () => {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const tableRef = useRef(null);
  const navigate = useNavigate();

  // State management
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("table");
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          navigate("/admin");
          return;
        }

        const response = await axios.get(`${baseUrl}/books`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          setBooks(response.data);
          setFilteredBooks(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy sách:", error);
        toast.error(error.response?.data?.message || "Không thể tải sách");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [navigate]);

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
    let filtered = [...books];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (book) => book.category.name === selectedCategory
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      if (selectedStatus === "in_stock") {
        filtered = filtered.filter((book) => book.quantity > 0);
      } else if (selectedStatus === "out_of_stock") {
        filtered = filtered.filter((book) => book.quantity === 0);
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "author") {
        aValue = a.author.name;
        bValue = b.author.name;
      } else if (sortBy === "category") {
        aValue = a.category.name;
        bValue = b.category.name;
      } else if (sortBy === "price") {
        aValue = a.price.newPrice;
        bValue = b.price.newPrice;
      } else if (sortBy === "publish") {
        aValue = a.publish.name;
        bValue = b.publish.name;
      }

      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    setFilteredBooks(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [
    books,
    searchQuery,
    selectedCategory,
    selectedStatus,
    sortBy,
    sortOrder,
    itemsPerPage,
  ]);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBooks.slice(startIndex, endIndex);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Smooth scroll to top of table
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number.parseInt(value));
    setCurrentPage(1);
  };

  // CRUD handlers
  const handleDelete = async (bookId) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      await axios.delete(`${baseUrl}/books/${bookId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBooks(books.filter((book) => book._id !== bookId));
      setShowDeleteDialog(false);
      setSelectedBook(null);
      toast.success("Xóa sách thành công");
    } catch (error) {
      console.error("Lỗi khi xóa sách:", error);
      toast.error(error.response?.data?.message || "Không thể xóa sách");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${baseUrl}/books`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setBooks(response.data);
        setFilteredBooks(response.data);
        toast.success("Sách đã được cập nhật thành công");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật sách:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật sách");
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique categories for filter
  const categories = [...new Set(books.map((book) => book.category.name))];

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
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{" "}
            {Math.min(currentPage * itemsPerPage, filteredBooks.length)} của{" "}
            {filteredBooks.length} kết quả
          </span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-600">trang</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === "number" && handlePageChange(page)}
              disabled={page === "..."}
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
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
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản lý sách
                </h1>
                <p className="text-gray-600">Quản lý kho sách và catelog</p>
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
                Cập nhật
              </Button>
              <Button
                className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                onClick={() => navigate("/dashboard/add-new-book")}
              >
                <Plus className="h-4 w-4" />
                Thêm sách
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mt-6 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm sách theo tiêu đề hoặc tác giả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/70 backdrop-blur-sm"
              />
            </div>

            <div className="flex gap-3">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-40 bg-white/70 backdrop-blur-sm">
                  <SelectValue placeholder="Thể loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thể loại</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32 bg-white/70 backdrop-blur-sm">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="in_stock">Còn hàng</SelectItem>
                  <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 bg-white/70 backdrop-blur-sm">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Tiêu đề</SelectItem>
                  <SelectItem value="author">Tác giả</SelectItem>
                  <SelectItem value="category">Thể loại</SelectItem>
                  <SelectItem value="price">Giá</SelectItem>
                  <SelectItem value="quantity">Số lượng</SelectItem>
                  <SelectItem value="publish">Nhà xuất bản</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="bg-white/70 backdrop-blur-sm"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>

              <div className="flex border rounded-lg bg-white/70 backdrop-blur-sm">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-l-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng số sách</p>
                  <p className="font-semibold">{filteredBooks.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bán chạy</p>
                  <p className="font-semibold">
                    {filteredBooks.filter((b) => b.trending).length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Package className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sắp hết hàng</p>
                  <p className="font-semibold">
                    {filteredBooks.filter((b) => b.quantity < 10).length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giá trung bình</p>
                  <p className="font-semibold">
                    {formatPrice(
                      filteredBooks.reduce(
                        (acc, b) => acc + b.price.newPrice,
                        0
                      ) / filteredBooks.length || 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Table View */}
          {viewMode === "table" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sách
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tác giả
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thể loại
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence mode="wait">
                    {getCurrentPageItems().map((book, index) => (
                      <motion.tr
                        key={book._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={book.coverImage || "/placeholder.svg"}
                                alt={book.title}
                                className="w-12 h-16 object-cover rounded-lg shadow-sm"
                              />
                              {book.trending && (
                                <div className="absolute -top-1 -right-1 p-1 bg-yellow-400 rounded-full">
                                  <Star className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 line-clamp-2">
                                {book.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {book._id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">
                              {book.author.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="gap-1">
                            <Tag className="h-3 w-3" />
                            {book.category.name}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {formatPrice(book.price.newPrice)}
                            </span>
                            {book.price.oldPrice > book.price.newPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(book.price.oldPrice)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span
                              className={`font-medium ${
                                book.quantity < 10
                                  ? "text-red-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {book.quantity}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              book.quantity > 0 ? "default" : "secondary"
                            }
                          >
                            {book.quantity > 0 ? "Còn hàng" : "Hết hàng"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedBook(book);
                                  setShowDetailsDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/dashboard/edit-book/${book._id}`)
                                }
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedBook(book);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="wait">
                  {getCurrentPageItems().map((book, index) => (
                    <motion.div
                      key={book._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={book.coverImage || "/placeholder.svg"}
                          alt={book.title}
                          className="w-full h-48 object-cover"
                        />
                        {book.trending && (
                          <div className="absolute top-2 right-2 p-1 bg-yellow-400 rounded-full">
                            <Star className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <Badge
                          variant={
                            book.status === "active" ? "default" : "secondary"
                          }
                          className="absolute top-2 left-2"
                        >
                          {book.status}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {book.author.name}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {book.category.name}
                          </Badge>
                          <span className="font-medium text-gray-900">
                            {formatPrice(book.price.newPrice)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Stock: {book.quantity}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedBook(book);
                                  setShowDetailsDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/dashboard/edit-book/${book._id}`)
                                }
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedBook(book);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Pagination */}
          <PaginationControls />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa sách</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa "{selectedBook?.title}"? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(selectedBook?._id)}
              disabled={isLoading}
            >
              {isLoading ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Book Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết sách</DialogTitle>
          </DialogHeader>
          {selectedBook && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedBook.coverImage || "/placeholder.svg"}
                  alt={selectedBook.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedBook.title}
                  </h3>
                  <p className="text-gray-600">by {selectedBook.author.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Thể loại:</span>
                    <p className="font-medium">{selectedBook.category.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Giá:</span>
                    <p className="font-medium">
                      {formatPrice(selectedBook.price.newPrice)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Số lượng:</span>
                    <p className="font-medium">{selectedBook.quantity}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Trạng thái:</span>
                    <p className="font-medium">
                      {selectedBook.quantity > 0 ? "Còn hàng" : "Hết hàng"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Ngôn ngữ:</span>
                    <p className="font-medium">{selectedBook.language}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Nhà xuất bản:</span>
                    <p className="font-medium">{selectedBook.publish.name}</p>
                  </div>
                </div>
                {selectedBook.trending && (
                  <Badge className="gap-1">
                    <Star className="h-3 w-3" />
                    Bán chạy
                  </Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedManageBooks;
