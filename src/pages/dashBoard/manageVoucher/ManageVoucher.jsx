/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Percent,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Download,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  useGetAllVouchersQuery,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
  useCreateVoucherMutation,
} from "@/redux/features/voucher/voucherApi"
import { toast } from "react-hot-toast"

const initialFormData = {
  code: "",
  type: "percentage",
  value: 0,
  minOrderValue: 0,
  maxDiscount: null,
  startDate: "",
  endDate: "",
  usageLimit: null,
  description: "",
  isActive: true,
}

export default function AdminVoucherManagement() {
  const [vouchers, setVouchers] = useState([])
  const [filteredVouchers, setFilteredVouchers] = useState([])
  const [formData, setFormData] = useState(initialFormData)
  const [editingVoucher, setEditingVoucher] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Get vouchers from API
  const { data: vouchersData, isLoading: isLoadingVouchers, error: vouchersError } = useGetAllVouchersQuery()
  const [updateVoucher] = useUpdateVoucherMutation()
  const [deleteVoucher] = useDeleteVoucherMutation()
  const [createVoucher] = useCreateVoucherMutation()

  useEffect(() => {
    if (vouchersData?.data) {
      setVouchers(vouchersData.data)
      setFilteredVouchers(vouchersData.data)
    }
  }, [vouchersData])

  // Filter vouchers based on search and status
  useEffect(() => {
    let filtered = vouchers.filter(
      (voucher) =>
        voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (filterStatus !== "all") {
      const now = new Date()
      filtered = filtered.filter((voucher) => {
        switch (filterStatus) {
          case "active":
            return voucher.isActive && new Date(voucher.endDate) > now
          case "inactive":
            return !voucher.isActive
          case "expired":
            return new Date(voucher.endDate) <= now
          default:
            return true
        }
      })
    }

    setFilteredVouchers(filtered)
  }, [vouchers, searchTerm, filterStatus])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const generateVoucherCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((prev) => ({ ...prev, code: result }))
  }

  const validateForm = () => {
    if (!formData.code.trim()) {
      setError("Mã voucher không được để trống")
      return false
    }
    if (formData.value <= 0) {
      setError("Giá trị voucher phải lớn hơn 0")
      return false
    }
    if (formData.type === "percentage" && formData.value > 100) {
      setError("Phần trăm giảm giá không được vượt quá 100%")
      return false
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("Ngày kết thúc phải sau ngày bắt đầu")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (editingVoucher) {
        // Update existing voucher
        const result = await updateVoucher({
          voucherId: editingVoucher._id,
          ...formData,
        }).unwrap()

        if (result.success) {
          setVouchers((prev) => prev.map((v) => (v._id === editingVoucher._id ? result.data : v)))
          toast.success("Cập nhật voucher thành công!")
        }
      } else {
        // Create new voucher
        const result = await createVoucher(formData).unwrap()
        if (result.success) {
          setVouchers((prev) => [result.data, ...prev])
          toast.success("Tạo voucher thành công!")
        }
      }

      setFormData(initialFormData)
      setEditingVoucher(null)
      setIsDialogOpen(false)
    } catch (error) {
      setError(error.data?.message || "Có lỗi xảy ra, vui lòng thử lại")
      toast.error(error.data?.message || "Có lỗi xảy ra, vui lòng thử lại")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (voucher) => {
    setEditingVoucher(voucher)
    // Format dates to YYYY-MM-DDThh:mm format for datetime-local input
    const formatDateForInput = (dateString) => {
      const date = new Date(dateString)
      return date.toISOString().slice(0, 16) // Format: YYYY-MM-DDThh:mm
    }

    setFormData({
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
      minOrderValue: voucher.minOrderValue,
      maxDiscount: voucher.maxDiscount || null,
      startDate: formatDateForInput(voucher.startDate),
      endDate: formatDateForInput(voucher.endDate),
      usageLimit: voucher.usageLimit || null,
      description: voucher.description,
      isActive: voucher.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (voucherId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa voucher này?")) return

    setIsLoading(true)
    try {
      const result = await deleteVoucher(voucherId).unwrap()
      if (result.success) {
        setVouchers((prev) => prev.filter((v) => v._id !== voucherId))
        toast.success("Xóa voucher thành công!")
      }
    } catch (error) {
      toast.error(error.data?.message || "Có lỗi xảy ra khi xóa voucher")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVoucherStatus = async (voucherId) => {
    setIsLoading(true)
    try {
      const voucher = vouchers.find((v) => v._id === voucherId)
      if (!voucher) return

      const result = await updateVoucher({
        voucherId,
        isActive: !voucher.isActive,
      }).unwrap()

      if (result.success) {
        setVouchers((prev) => prev.map((v) => (v._id === voucherId ? result.data : v)))
        toast.success("Cập nhật trạng thái thành công!")
      }
    } catch (error) {
      toast.error(error.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái")
    } finally {
      setIsLoading(false)
    }
  }

  const copyVoucherCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success(`Đã sao chép mã: ${code}`)
  }

  const getVoucherStatus = (voucher) => {
    const now = new Date()
    const endDate = new Date(voucher.endDate)

    if (!voucher.isActive) return { label: "Tạm dừng", color: "secondary" }
    if (endDate <= now) return { label: "Hết hạn", color: "destructive" }
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return { label: "Hết lượt", color: "destructive" }
    }
    return { label: "Hoạt động", color: "default" }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  if (isLoadingVouchers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải dữ liệu voucher...</p>
        </motion.div>
      </div>
    )
  }

  if (vouchersError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
          <p className="text-red-500 mb-4">Không thể tải dữ liệu voucher</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Quản lý Voucher
                </h1>
                <p className="text-gray-600 text-lg">Tạo và quản lý các mã giảm giá cho khách hàng</p>
              </div>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  setEditingVoucher(null)
                  setFormData(initialFormData)
                  setError("")
                }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Tạo Voucher Mới
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl font-bold">
                  {editingVoucher ? "Chỉnh sửa Voucher" : "Tạo Voucher Mới"}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {editingVoucher
                    ? "Cập nhật thông tin voucher hiện có"
                    : "Điền thông tin để tạo voucher mới cho khách hàng"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                {/* Voucher Code */}
                <div className="space-y-3">
                  <Label htmlFor="code" className="text-sm font-semibold text-gray-700">
                    Mã Voucher *
                  </Label>
                  <div className="flex gap-3">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                      placeholder="VD: WELCOME10"
                      className="font-mono uppercase text-lg"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateVoucherCode}
                      className="px-4 whitespace-nowrap"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Tạo mã
                    </Button>
                  </div>
                </div>

                {/* Type and Value */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="type" className="text-sm font-semibold text-gray-700">
                      Loại Giảm Giá *
                    </Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Chọn loại giảm giá" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          <div className="flex items-center gap-2">
                            <Percent className="w-4 h-4 text-blue-500" />
                            Phần trăm (%)
                          </div>
                        </SelectItem>
                        <SelectItem value="fixed">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            Số tiền cố định (VNĐ)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="value" className="text-sm font-semibold text-gray-700">
                      Giá Trị * {formData.type === "percentage" ? "(%)" : "(VNĐ)"}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value}
                      onChange={(e) => handleInputChange("value", Number(e.target.value))}
                      placeholder={formData.type === "percentage" ? "VD: 10" : "VD: 50000"}
                      className="h-12 text-lg"
                      min="0"
                      max={formData.type === "percentage" ? "100" : undefined}
                      required
                    />
                  </div>
                </div>

                {/* Min Order Value and Max Discount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="minOrderValue" className="text-sm font-semibold text-gray-700">
                      Giá Trị Đơn Hàng Tối Thiểu (VNĐ)
                    </Label>
                    <Input
                      id="minOrderValue"
                      type="number"
                      value={formData.minOrderValue}
                      onChange={(e) => handleInputChange("minOrderValue", Number(e.target.value))}
                      placeholder="VD: 100000"
                      className="h-12"
                      min="0"
                    />
                  </div>

                  {formData.type === "percentage" && (
                    <div className="space-y-3">
                      <Label htmlFor="maxDiscount" className="text-sm font-semibold text-gray-700">
                        Giảm Giá Tối Đa (VNĐ)
                      </Label>
                      <Input
                        id="maxDiscount"
                        type="number"
                        value={formData.maxDiscount || ""}
                        onChange={(e) =>
                          handleInputChange("maxDiscount", e.target.value ? Number(e.target.value) : null)
                        }
                        placeholder="VD: 50000"
                        className="h-12"
                        min="0"
                      />
                    </div>
                  )}
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700">
                      Ngày Bắt Đầu *
                    </Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700">
                      Ngày Kết Thúc *
                    </Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                {/* Usage Limit */}
                <div className="space-y-3">
                  <Label htmlFor="usageLimit" className="text-sm font-semibold text-gray-700">
                    Giới Hạn Sử Dụng
                  </Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit || ""}
                    onChange={(e) => handleInputChange("usageLimit", e.target.value ? Number(e.target.value) : null)}
                    placeholder="Để trống nếu không giới hạn"
                    className="h-12"
                    min="1"
                  />
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                    Mô Tả
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Nhập mô tả chi tiết về voucher này..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                      Trạng thái voucher
                    </Label>
                    <p className="text-sm text-gray-500">Bật để kích hoạt voucher ngay sau khi tạo</p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setFormData(initialFormData)
                      setEditingVoucher(null)
                      setError("")
                    }}
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-w-[120px]"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : editingVoucher ? (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Cập nhật
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo voucher
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Tổng Voucher</p>
                  <p className="text-3xl font-bold text-blue-900">{vouchers.length}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Đang Hoạt Động</p>
                  <p className="text-3xl font-bold text-green-900">
                    {vouchers.filter((v) => v.isActive && new Date(v.endDate) > new Date()).length}
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Đã Sử Dụng</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {vouchers.reduce((sum, v) => sum + (v.usedCount || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-orange-500 rounded-full">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Hết Hạn</p>
                  <p className="text-3xl font-bold text-red-900">
                    {vouchers.filter((v) => new Date(v.endDate) <= new Date()).length}
                  </p>
                </div>
                <div className="p-3 bg-red-500 rounded-full">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Tìm kiếm theo mã voucher hoặc mô tả..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 text-base"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48 h-12">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="active">Đang hoạt động</SelectItem>
                      <SelectItem value="inactive">Tạm dừng</SelectItem>
                      <SelectItem value="expired">Hết hạn</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="lg" className="px-4">
                    <Download className="w-4 h-4 mr-2" />
                    Xuất Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vouchers Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="text-xl">Danh Sách Voucher</CardTitle>
              <CardDescription className="text-base">
                Hiển thị {filteredVouchers.length} trong tổng số {vouchers.length} voucher
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Mã Voucher</TableHead>
                      <TableHead className="font-semibold">Loại & Giá Trị</TableHead>
                      <TableHead className="font-semibold">Điều Kiện</TableHead>
                      <TableHead className="font-semibold">Thời Hạn</TableHead>
                      <TableHead className="font-semibold">Trạng Thái</TableHead>
                      <TableHead className="font-semibold">Sử Dụng</TableHead>
                      <TableHead className="text-right font-semibold">Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredVouchers.map((voucher, index) => {
                        const status = getVoucherStatus(voucher)
                        return (
                          <motion.tr
                            key={voucher._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-gray-50 transition-colors"
                          >
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <code className="bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono font-semibold">
                                  {voucher.code}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyVoucherCode(voucher.code)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>

                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                {voucher.type === "percentage" ? (
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <Percent className="w-4 h-4 text-blue-600" />
                                  </div>
                                ) : (
                                  <div className="p-2 bg-green-100 rounded-lg">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold">
                                    {voucher.type === "percentage"
                                      ? `${voucher.value}%`
                                      : formatCurrency(voucher.value)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {voucher.type === "percentage" ? "Phần trăm" : "Cố định"}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="py-4">
                              <div className="space-y-1">
                                <div className="text-sm">
                                  <span className="text-gray-500">Tối thiểu:</span>{" "}
                                  <span className="font-medium">{formatCurrency(voucher.minOrderValue)}</span>
                                </div>
                                {voucher.maxDiscount && (
                                  <div className="text-sm">
                                    <span className="text-gray-500">Tối đa:</span>{" "}
                                    <span className="font-medium">{formatCurrency(voucher.maxDiscount)}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="py-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span>
                                    {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
                                  </span>
                                </div>
                                {voucher.usageLimit && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span>
                                      {voucher.usedCount || 0}/{voucher.usageLimit} lượt
                                    </span>
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="py-4">
                              <Badge variant={status.color} className="px-3 py-1 text-xs font-medium">
                                {status.label}
                              </Badge>
                            </TableCell>

                            <TableCell className="py-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {voucher.usedCount || 0}
                                    {voucher.usageLimit ? `/${voucher.usageLimit}` : ""}
                                  </span>
                                </div>
                                {voucher.usageLimit && (
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full transition-all"
                                      style={{
                                        width: `${Math.min(((voucher.usedCount || 0) / voucher.usageLimit) * 100, 100)}%`,
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="text-right py-4">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(voucher)}
                                  className="hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleVoucherStatus(voucher._id)}
                                  className={
                                    voucher.isActive
                                      ? "hover:bg-red-50 hover:text-red-600"
                                      : "hover:bg-green-50 hover:text-green-600"
                                  }
                                >
                                  {voucher.isActive ? (
                                    <XCircle className="w-4 h-4" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(voucher._id)}
                                  className="hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {filteredVouchers.length === 0 && (
                <div className="text-center py-16">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <DollarSign className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Không tìm thấy voucher</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {searchTerm || filterStatus !== "all"
                        ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả khác"
                        : "Chưa có voucher nào được tạo. Hãy tạo voucher đầu tiên của bạn!"}
                    </p>
                    {!searchTerm && filterStatus === "all" && (
                      <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo Voucher Đầu Tiên
                      </Button>
                    )}
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
