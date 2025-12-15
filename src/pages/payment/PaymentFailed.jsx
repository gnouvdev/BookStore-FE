import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/button";
// eslint-disable-next-line no-unused-vars
import { t } from "i18next";

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get("errorCode");

  // Mã lỗi VNPay
  const getErrorMessage = (code) => {
    const errorMessages = {
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
      "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking",
      10: "Xác thực thông tin thẻ/tài khoản không đúng. Quá 3 lần",
      11: "Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.",
      12: "Thẻ/Tài khoản bị khóa.",
      13: "Nhập sai mật khẩu xác thực giao dịch (OTP). Quá số lần quy định.",
      24: "Khách hàng hủy giao dịch.",
      51: "Tài khoản không đủ số dư để thực hiện giao dịch.",
      65: "Tài khoản đã vượt quá hạn mức giao dịch trong ngày.",
      75: "Ngân hàng thanh toán đang bảo trì.",
      79: "Nhập sai mật khẩu thanh toán quá số lần quy định.",
      99: "Lỗi không xác định được.",
      97: "Lỗi checksum không hợp lệ.",
    };

    return (
      errorMessages[code] ||
      "Thanh toán không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ."
    );
  };

  // Detect nếu user hủy thanh toán
  // Mã 24 là "Khách hàng hủy giao dịch" theo tài liệu VNPay
  // Nếu không có errorCode hoặc errorCode là 24, coi như user đã hủy
  const isCancelled = errorCode === "24" || errorCode === null || !errorCode;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg"
          >
            <XCircle className="w-12 h-12 text-red-500" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isCancelled ? "Đã hủy thanh toán" : "Thanh toán không thành công"}
          </h1>
          <p className="text-white/90 text-lg">
            {isCancelled
              ? "Bạn đã hủy quá trình thanh toán"
              : "Có lỗi xảy ra trong quá trình thanh toán"}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              {isCancelled ? "Thông báo" : "Chi tiết lỗi"}
            </h3>
            <p className="text-red-700">
              {isCancelled
                ? "Bạn đã hủy quá trình thanh toán. Đơn hàng của bạn đã được tự động hủy. Nếu bạn muốn tiếp tục mua hàng, vui lòng đặt hàng lại."
                : errorCode
                ? getErrorMessage(errorCode)
                : "Thanh toán không thành công. Vui lòng thử lại."}
            </p>
            {errorCode && (
              <p className="text-sm text-red-600 mt-2">
                Mã lỗi:{" "}
                <span className="font-mono font-semibold">{errorCode}</span>
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Bạn có thể:</h4>
            <ul className="list-disc list-inside space-y-2 text-blue-800">
              <li>Thử lại thanh toán với phương thức khác</li>
              <li>Kiểm tra lại thông tin thẻ/tài khoản</li>
              <li>Liên hệ ngân hàng để được hỗ trợ</li>
              {isCancelled && (
                <li>Đặt hàng lại nếu bạn muốn tiếp tục mua sắm</li>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate("/checkout")}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {isCancelled ? "Đặt hàng lại" : "Thử lại thanh toán"}
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailed;
