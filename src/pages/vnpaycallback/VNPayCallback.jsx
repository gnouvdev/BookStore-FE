import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../../redux/features/cart/cartSlice";
import { useClearCartMutation } from "../../redux/features/cart/cartApi";
import { useVerifyVNPayPaymentMutation } from "../../redux/features/payments/paymentsApi";
import Swal from "sweetalert2";
import { t } from "i18next";

const VNPayCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [clearCartApi] = useClearCartMutation();
  const [verifyPayment] = useVerifyVNPayPaymentMutation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Kiểm tra token
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          Swal.fire({
            title: t("payment.error"),
            text: t("payment.session_expired"),
            icon: "error",
          });
          navigate("/login");
          return;
        }

        // Lấy tất cả query params từ URL
        const queryParams = new URLSearchParams(
          window.location.search
        ).toString();
        console.log("VNPay callback params:", queryParams);

        // Gọi API verify payment
        const response = await verifyPayment(queryParams).unwrap();
        console.log("VNPay verify response:", response);

        if (response.success) {
          console.log("Payment successful, clearing cart...");
          try {
            // Xóa giỏ hàng ở server
            const clearCartResponse = await clearCartApi().unwrap();
            console.log("Clear cart response:", clearCartResponse);

            // Xóa giỏ hàng ở Redux
            dispatch(clearCart());
            console.log("Cart cleared in Redux");

            // Refresh cart data
            window.location.reload();

            Swal.fire({
              title: t("payment.success"),
              text: t("payment.order_confirmed"),
              icon: "success",
            });

            navigate("/orders/thanks");
          } catch (clearCartError) {
            console.error("Error clearing cart:", clearCartError);
            // Thử xóa giỏ hàng ở Redux nếu server call thất bại
            dispatch(clearCart());
            Swal.fire({
              title: t("payment.warning"),
              text: t("payment.cart_not_cleared"),
              icon: "warning",
            });
            navigate("/orders/thanks");
          }
        } else {
          console.log("Payment failed:", response);
          Swal.fire({
            title: t("payment.failed"),
            text: t("payment.try_again"),
            icon: "error",
          });
          navigate("/checkout");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        Swal.fire({
          title: t("payment.error"),
          text: t("payment.error_message"),
          icon: "error",
        });
        navigate("/checkout");
      }
    };

    handleCallback();
  }, [dispatch, navigate, clearCartApi, verifyPayment]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t("payment.processing")}</p>
      </div>
    </div>
  );
};

export default VNPayCallback;
