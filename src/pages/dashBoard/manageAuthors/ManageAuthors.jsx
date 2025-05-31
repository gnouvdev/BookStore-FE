/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  User,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  BookOpen,
  Mail,
  MapPin,
  Award,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  useGetAuthorsQuery,
  useAddAuthorMutation,
  useUpdateAuthorMutation,
  useDeleteAuthorMutation,
} from "@/redux/features/authors/authorsApi";
import { useGetBooksByAuthorQuery } from "@/redux/features/books/booksApi";

const EnhancedManageAuthors = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const tableRef = useRef(null);

  // State management
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    biography: "",
    image: "",
  });
  const [showBooksModal, setShowBooksModal] = useState(false);

  // RTK Query hooks
  const { data: authors = [], isLoading } = useGetAuthorsQuery();
  const [addAuthor] = useAddAuthorMutation();
  const [updateAuthor] = useUpdateAuthorMutation();
  const [deleteAuthor] = useDeleteAuthorMutation();
  const { data: authorBooks = [], isLoading: isLoadingBooks } =
    useGetBooksByAuthorQuery(selectedAuthor?._id, { skip: !selectedAuthor });

  // Memoize filtered authors
  const filteredAuthors = useMemo(() => {
    let filtered = [...authors];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (author) =>
          author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          author.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          author.country?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((author) => author.status === selectedStatus);
    }

    // Sorting
    return filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [authors, searchQuery, selectedStatus, sortBy, sortOrder]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredAuthors.length / itemsPerPage);
  }, [filteredAuthors.length, itemsPerPage]);

  // Get current page items
  const currentPageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAuthors.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage, filteredAuthors]);

  // Update current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, sortBy, sortOrder]);

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

  // Pagination handlers
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleItemsPerPageChange = useCallback((value) => {
    setItemsPerPage(Number.parseInt(value));
    setCurrentPage(1);
  }, []);

  // Form handlers
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      biography: "",
      image: "",
    });
  }, []);

  // Add author handler
  const handleAddAuthor = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await addAuthor(formData).unwrap();
        setShowAddModal(false);
        resetForm();
        toast.success("Thêm tác giả thành công");
      } catch (err) {
        toast.error(err.data?.message || "Thêm tác giả thất bại");
      }
    },
    [addAuthor, formData, resetForm]
  );

  // Edit author handler
  const handleEditAuthor = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await updateAuthor({ id: selectedAuthor._id, ...formData }).unwrap();
        setShowEditModal(false);
        setSelectedAuthor(null);
        resetForm();
        toast.success("Cập nhật tác giả thành công");
      } catch (err) {
        toast.error(err.data?.message || "Cập nhật tác giả thất bại");
      }
    },
    [updateAuthor, selectedAuthor, formData, resetForm]
  );

  // Delete author handler
  const handleDeleteAuthor = useCallback(async () => {
    try {
      await deleteAuthor(selectedAuthor._id).unwrap();
      setShowDeleteModal(false);
      setSelectedAuthor(null);
      toast.success("Xóa tác giả thành công");
    } catch (err) {
      toast.error(err.data?.message || "Xóa tác giả thất bại");
    }
  }, [deleteAuthor, selectedAuthor]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    // RTK Query will automatically refetch the data
    toast.success("Tác giả đã được cập nhật");
  }, []);

  // Format price to VNĐ
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Open edit dialog with pre-filled data
  const openEditDialog = useCallback((author) => {
    setSelectedAuthor(author);
    setFormData({
      name: author.name,
      biography: author.bio,
      image: author.avatar,
    });
    setShowEditModal(true);
  }, []);

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
            {Math.min(currentPage * itemsPerPage, filteredAuthors.length)} của{" "}
            {filteredAuthors.length} kết quả
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
              <SelectItem value="100">100</SelectItem>
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

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100"
    >
      {/* Header Section */}
      <div
        ref={headerRef}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Quản lý tác giả
                </h1>
                <p className="text-gray-600">
                  Quản lý cơ sở dữ liệu và hồ sơ tác giả của bạn
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
                Cập nhật
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Thêm tác giả
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mt-6 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm tác giả theo tên, email, hoặc quốc gia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/70 backdrop-blur-sm"
              />
            </div>

            <div className="flex gap-3">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32 bg-white/70 backdrop-blur-sm">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 bg-white/70 backdrop-blur-sm">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Tên</SelectItem>
                  <SelectItem value="booksCount">Sách</SelectItem>
                  <SelectItem value="totalSales">Doanh thu</SelectItem>
                  <SelectItem value="rating">Điểm đánh giá</SelectItem>
                  <SelectItem value="joinDate">Ngày tham gia</SelectItem>
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
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng số tác giả</p>
                  <p className="font-semibold">{authors.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng số sách</p>
                  <p className="font-semibold">
                    {authors.reduce(
                      (acc, author) => acc + (author.books?.length || 0),
                      0
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tác giả hoạt động</p>
                  <p className="font-semibold">
                    {
                      authors.filter((author) => author.status === "active")
                        .length
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Điểm trung bình</p>
                  <p className="font-semibold">
                    {authors.length > 0
                      ? (
                          authors.reduce(
                            (acc, author) => acc + (author.rating || 0),
                            0
                          ) / authors.length
                        ).toFixed(1)
                      : "0.0"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className="overflow-auto"
            style={{ maxHeight: "calc(100vh - 300px)" }}
          >
            <table className="w-full">
              <thead className="bg-gray-50/80 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tác giả
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sách
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence mode="wait">
                  {currentPageItems.map((author, index) => (
                    <motion.tr
                      key={author._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {author.avatar ? (
                            <img
                              src={author.avatar}
                              alt={author.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                              {author.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {author.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {author._id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelectedAuthor(author);
                            setShowBooksModal(true);
                          }}
                          className="flex items-center gap-2"
                        >
                          <BookOpen className="h-4 w-4" />
                          <span>{author.booksCount} sách</span>
                        </Button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedAuthor(author);
                              setFormData({
                                name: author.name,
                                biography: author.bio,
                                image: author.avatar,
                              });
                              setShowEditModal(true);
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedAuthor(author);
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

          {/* Books List Modal */}
          <Dialog open={showBooksModal} onOpenChange={setShowBooksModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Sách của {selectedAuthor?.name}</DialogTitle>
                <DialogDescription>
                  Danh sách sách được viết bởi tác giả này
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {isLoadingBooks ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : authorBooks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Không tìm thấy sách cho tác giả này
                  </div>
                ) : (
                  authorBooks.map((book) => (
                    <div
                      key={book._id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <img
                        src={book.coverImage || "/placeholder.svg"}
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {book.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {book.description}
                        </p>
                        <div className="mt-2 flex items-center gap-4">
                          <span className="text-sm text-gray-500">
                            Price: {formatPrice(book.price.newPrice)}
                          </span>
                          <span className="text-sm text-gray-500">
                            Stock: {book.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowBooksModal(false)}
                >
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Pagination */}
          <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t">
            <PaginationControls />
          </div>
        </div>
      </div>

      {/* Add Author Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm tác giả mới</DialogTitle>
            <DialogDescription>
              Tạo hồ sơ tác giả mới cho cửa hàng sách của bạn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tên</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nhập tên tác giả"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Nhập email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Nhập quốc gia"
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.biography}
                onChange={(e) => handleInputChange("biography", e.target.value)}
                placeholder="Nhập biểu ngữ của tác giả"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Hủy bỏ
            </Button>
            <Button onClick={handleAddAuthor} disabled={isLoading}>
              {isLoading ? "Đang thêm..." : "Thêm tác giả"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Author Dialog */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Author</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin của tác giả.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Tên</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nhập tên tác giả"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Nhập email"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div>
              <Label htmlFor="edit-country">Country</Label>
              <Input
                id="edit-country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Nhập quốc gia"
              />
            </div>
            <div>
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={formData.biography}
                onChange={(e) => handleInputChange("biography", e.target.value)}
                placeholder="Nhập biểu ngữ của tác giả"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Hủy bỏ
            </Button>
            <Button onClick={handleEditAuthor} disabled={isLoading}>
              {isLoading ? "Đang cập nhật..." : "Cập nhật tác giả"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Author</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa "{selectedAuthor?.name}"? Hành động
              này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAuthor}
              disabled={isLoading}
            >
                {isLoading ? "Đang xóa..." : "Xóa tác giả"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedManageAuthors;
