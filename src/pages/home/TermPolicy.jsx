/* eslint-disable no-unused-vars */
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Shield,
  FileText,
  Lock,
  Cookie,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
  Users,
  CreditCard,
  Truck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function TermsPolicyPage() {
  const [activeTab, setActiveTab] = useState("terms")

  const lastUpdated = "15 tháng 12, 2024"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <motion.section
        className="relative py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fillRule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fillOpacity=&quot;.1&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div className="text-center" variants={fadeInUp} initial="initial" animate="animate">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Điều Khoản & Chính Sách</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Terms & Privacy Policy
            </h1>

            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Chúng tôi cam kết bảo vệ quyền riêng tư và cung cấp dịch vụ minh bạch, đáng tin cậy cho tất cả người dùng.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Calendar className="w-4 h-4 mr-2" />
                Cập nhật: {lastUpdated}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <CheckCircle className="w-4 h-4 mr-2" />
                Tuân thủ GDPR
              </Badge>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <motion.section className="py-16 px-4" variants={staggerContainer} initial="initial" animate="animate">
        <div className="container mx-auto max-w-6xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto p-1 bg-white shadow-lg">
              <TabsTrigger
                value="terms"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Điều Khoản</span>
              </TabsTrigger>
              <TabsTrigger
                value="privacy"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Bảo Mật</span>
              </TabsTrigger>
              <TabsTrigger
                value="cookies"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Cookie className="w-4 h-4" />
                <span className="hidden sm:inline">Cookies</span>
              </TabsTrigger>
              <TabsTrigger
                value="refund"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Hoàn Trả</span>
              </TabsTrigger>
            </TabsList>

            {/* Terms of Service */}
            <TabsContent value="terms">
              <motion.div variants={fadeInUp}>
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <FileText className="w-6 h-6" />
                      Điều Khoản Sử Dụng
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Các điều khoản và điều kiện sử dụng dịch vụ của chúng tôi
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Bằng việc sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản dưới đây.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-500" />
                          1. Chấp Nhận Điều Khoản
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          Khi truy cập và sử dụng website này, bạn chấp nhận bị ràng buộc bởi các điều khoản và điều
                          kiện sử dụng và chính sách bảo mật. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng
                          không sử dụng dịch vụ.
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-500" />
                          2. Quyền và Nghĩa Vụ Người Dùng
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700">
                              Cung cấp thông tin chính xác và cập nhật khi đăng ký tài khoản
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700">
                              Bảo mật thông tin đăng nhập và chịu trách nhiệm về mọi hoạt động trong tài khoản
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700">
                              Sử dụng dịch vụ một cách hợp pháp và không vi phạm quyền lợi của bên thứ ba
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700">
                              Không được sử dụng dịch vụ cho mục đích bất hợp pháp hoặc có hại
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-purple-500" />
                          3. Thanh Toán và Đơn Hàng
                        </h3>
                        <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                          <p className="text-gray-700">• Tất cả giá cả được hiển thị bằng VND và đã bao gồm VAT</p>
                          <p className="text-gray-700">• Đơn hàng chỉ được xác nhận sau khi thanh toán thành công</p>
                          <p className="text-gray-700">
                            • Chúng tôi có quyền từ chối hoặc hủy đơn hàng trong trường hợp bất thường
                          </p>
                          <p className="text-gray-700">• Khách hàng có thể hủy đơn hàng trong vòng 24h sau khi đặt</p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Truck className="w-5 h-5 text-orange-500" />
                          4. Giao Hàng và Vận Chuyển
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          Thời gian giao hàng dự kiến từ 1-7 ngày làm việc tùy theo địa điểm. Chúng tôi sẽ thông báo nếu
                          có sự chậm trễ. Khách hàng có trách nhiệm cung cấp địa chỉ chính xác và có mặt để nhận hàng.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Privacy Policy */}
            <TabsContent value="privacy">
              <motion.div variants={fadeInUp}>
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Lock className="w-6 h-6" />
                      Chính Sách Bảo Mật
                    </CardTitle>
                    <CardDescription className="text-green-100">
                      Cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn theo các tiêu chuẩn bảo mật cao nhất.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Info className="w-5 h-5 text-blue-500" />
                          Thu Thập Thông Tin
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Thông Tin Cá Nhân</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Họ tên, email, số điện thoại</li>
                              <li>• Địa chỉ giao hàng</li>
                              <li>• Thông tin thanh toán</li>
                            </ul>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2">Thông Tin Kỹ Thuật</h4>
                            <ul className="text-sm text-green-700 space-y-1">
                              <li>• Địa chỉ IP, trình duyệt</li>
                              <li>• Cookies và session</li>
                              <li>• Lịch sử truy cập</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-purple-500" />
                          Sử Dụng Thông Tin
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>Xử lý đơn hàng và cung cấp dịch vụ khách hàng</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>Gửi thông báo về đơn hàng và cập nhật dịch vụ</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>Cải thiện trải nghiệm người dùng và phát triển sản phẩm</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>Tuân thủ các yêu cầu pháp lý và bảo mật</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-red-500" />
                          Bảo Mật Dữ Liệu
                        </h3>
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg">
                          <p className="text-gray-700 mb-4">
                            Chúng tôi sử dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin của bạn:
                          </p>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm">Mã hóa SSL/TLS</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm">Firewall bảo mật</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm">Kiểm tra bảo mật định kỳ</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm">Phân quyền truy cập</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Cookie Policy */}
            <TabsContent value="cookies">
              <motion.div variants={fadeInUp}>
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Cookie className="w-6 h-6" />
                      Chính Sách Cookie
                    </CardTitle>
                    <CardDescription className="text-orange-100">
                      Thông tin về việc sử dụng cookies trên website
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <Alert>
                      <Cookie className="h-4 w-4" />
                      <AlertDescription>
                        Cookies giúp chúng tôi cung cấp trải nghiệm tốt hơn và cá nhân hóa nội dung cho bạn.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Cookie Là Gì?</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Cookies là các tệp văn bản nhỏ được lưu trữ trên thiết bị của bạn khi bạn truy cập website.
                          Chúng giúp website ghi nhớ thông tin về lần truy cập của bạn, làm cho lần truy cập tiếp theo
                          dễ dàng hơn.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4">Các Loại Cookie Chúng Tôi Sử Dụng</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="border border-blue-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Essential Cookies</h4>
                            <p className="text-sm text-gray-600 mb-3">Cần thiết cho hoạt động cơ bản của website</p>
                            <Badge variant="outline" className="text-blue-600 border-blue-300">
                              Bắt buộc
                            </Badge>
                          </div>
                          <div className="border border-green-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2">Analytics Cookies</h4>
                            <p className="text-sm text-gray-600 mb-3">Giúp chúng tôi hiểu cách bạn sử dụng website</p>
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              Tùy chọn
                            </Badge>
                          </div>
                          <div className="border border-purple-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-purple-800 mb-2">Functional Cookies</h4>
                            <p className="text-sm text-gray-600 mb-3">Ghi nhớ tùy chọn và cài đặt của bạn</p>
                            <Badge variant="outline" className="text-purple-600 border-purple-300">
                              Tùy chọn
                            </Badge>
                          </div>
                          <div className="border border-orange-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-orange-800 mb-2">Marketing Cookies</h4>
                            <p className="text-sm text-gray-600 mb-3">Hiển thị quảng cáo phù hợp với sở thích</p>
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              Tùy chọn
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4">Quản Lý Cookie</h3>
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <p className="text-gray-700 mb-4">Bạn có thể kiểm soát và quản lý cookies theo nhiều cách:</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Thay đổi cài đặt trình duyệt để chặn hoặc xóa cookies</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Sử dụng chế độ duyệt web riêng tư/ẩn danh</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Cài đặt tùy chọn cookie trên website của chúng tôi</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Refund Policy */}
            <TabsContent value="refund">
              <motion.div variants={fadeInUp}>
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <RefreshCw className="w-6 h-6" />
                      Chính Sách Hoàn Trả
                    </CardTitle>
                    <CardDescription className="text-purple-100">
                      Điều kiện và quy trình hoàn trả, đổi hàng
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <Alert>
                      <RefreshCw className="h-4 w-4" />
                      <AlertDescription>
                        Chúng tôi cam kết hỗ trợ hoàn trả trong vòng 30 ngày với điều kiện sản phẩm còn nguyên vẹn.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          Điều Kiện Hoàn Trả
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-green-700">✅ Được Chấp Nhận</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Sản phẩm lỗi từ nhà sản xuất</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Giao sai sản phẩm</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Sản phẩm bị hư hại trong vận chuyển</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Không hài lòng trong 30 ngày</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="font-semibold text-red-700">❌ Không Chấp Nhận</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span>Sản phẩm đã qua sử dụng</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span>Quá 30 ngày kể từ ngày mua</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span>Không có hóa đơn/chứng từ</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span>Sản phẩm đặc biệt/khuyến mãi</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <RefreshCw className="w-5 h-5 text-blue-500" />
                          Quy Trình Hoàn Trả
                        </h3>
                        <div className="grid md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                              1
                            </div>
                            <h4 className="font-semibold mb-2">Liên Hệ</h4>
                            <p className="text-sm text-gray-600">Gửi yêu cầu hoàn trả qua email hoặc hotline</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                              2
                            </div>
                            <h4 className="font-semibold mb-2">Xác Nhận</h4>
                            <p className="text-sm text-gray-600">Chúng tôi xem xét và xác nhận yêu cầu</p>
                          </div>
                          <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                              3
                            </div>
                            <h4 className="font-semibold mb-2">Gửi Hàng</h4>
                            <p className="text-sm text-gray-600">Bạn gửi sản phẩm về kho của chúng tôi</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                              4
                            </div>
                            <h4 className="font-semibold mb-2">Hoàn Tiền</h4>
                            <p className="text-sm text-gray-600">Xử lý hoàn tiền trong 5-7 ngày làm việc</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-xl font-semibold mb-4">Thời Gian Xử Lý</h3>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600 mb-2">24h</div>
                              <p className="text-sm text-gray-600">Phản hồi yêu cầu</p>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600 mb-2">3-5 ngày</div>
                              <p className="text-sm text-gray-600">Kiểm tra sản phẩm</p>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600 mb-2">5-7 ngày</div>
                              <p className="text-sm text-gray-600">Hoàn tiền</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        className="py-16 px-4 bg-gradient-to-r from-gray-900 to-blue-900 text-white"
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-8">Cần Hỗ Trợ Thêm?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-gray-300">support@company.com</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Hotline</h3>
                <p className="text-gray-300">1900 1234</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Địa Chỉ</h3>
                <p className="text-gray-300">123 Đường ABC, TP.HCM</p>
              </div>
            </div>
          </div>

          <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
            <Mail className="w-5 h-5 mr-2" />
            Liên Hệ Ngay
          </Button>
        </div>
      </motion.section>
    </div>
  )
}
