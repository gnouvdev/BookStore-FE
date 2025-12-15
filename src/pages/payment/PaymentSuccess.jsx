import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useDispatch } from "react-redux";
import { clearCart } from "../../redux/features/cart/cartSlice";
import { useClearCartMutation } from "../../redux/features/cart/cartApi";
import { t } from "i18next";
import toast from "react-hot-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [clearCartApi] = useClearCartMutation();

  useEffect(() => {
    // Clear cart when payment is successful
    const clearCartData = async () => {
      try {
        await clearCartApi().unwrap();
        dispatch(clearCart());
        toast.success("Giỏ hàng đã được xóa sau khi thanh toán thành công");
      } catch (error) {
        console.error("Error clearing cart:", error);
        // Still clear Redux cart even if API fails
        dispatch(clearCart());
      }
    };

    clearCartData();
  }, [dispatch, clearCartApi]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg"
          >
            <CheckCircle className="w-12 h-12 text-green-500" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Thanh toán thành công!
          </h1>
          <p className="text-white/90 text-lg">
            Đơn hàng của bạn đã được xác nhận
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Cảm ơn bạn đã mua sắm!
            </h3>
            <p className="text-green-700">
              Thanh toán của bạn đã được xử lý thành công. Chúng tôi sẽ gửi
              email xác nhận đơn hàng đến địa chỉ email của bạn trong thời gian
              sớm nhất.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">
              Bước tiếp theo:
            </h4>
            <ul className="list-disc list-inside space-y-2 text-blue-800">
              <li>Kiểm tra email để xem chi tiết đơn hàng</li>
              <li>Theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi"</li>
              <li>Chúng tôi sẽ liên hệ với bạn khi đơn hàng được giao</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate("/orders")}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              size="lg"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Xem đơn hàng
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
