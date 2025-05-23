import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaKey, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import baseUrl from "../utils/baseURL";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Verification Code, 3: New Password
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/auth/forgot-password`, {
        email,
      });
      if (response.data.success) {
        toast.success("Mã xác nhận đã được gửi đến email của bạn!");
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/auth/verify-code`, {
        email,
        code: verificationCode,
      });
      if (response.data.success) {
        toast.success("Mã xác nhận hợp lệ!");
        setStep(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Mã xác nhận không hợp lệ!");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/auth/reset-password`, {
        email,
        code: verificationCode,
        newPassword,
      });
      if (response.data.success) {
        toast.success("Đặt lại mật khẩu thành công!");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 1 && "Quên mật khẩu"}
            {step === 2 && "Xác nhận mã"}
            {step === 3 && "Đặt lại mật khẩu"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1 && "Nhập email của bạn để nhận mã xác nhận"}
            {step === 2 && "Nhập mã xác nhận đã được gửi đến email của bạn"}
            {step === 3 && "Nhập mật khẩu mới của bạn"}
          </p>
        </div>

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form
            className="mt-8 space-y-6"
            onSubmit={handleSendVerificationCode}
          >
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Verification Code */}
        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCheckCircle className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Mã xác nhận"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Đang xác nhận..." : "Xác nhận mã"}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaKey className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Mật khẩu mới"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaKey className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
