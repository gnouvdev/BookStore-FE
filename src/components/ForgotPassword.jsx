/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Key,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  Clock,
  Send,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

const ImprovedForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: New Password
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailSent, setEmailSent] = useState(false);

  // Mock baseUrl for demo
  const baseUrl = "http://localhost:5000/api";

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      setStep(2);
    }
  }, []);

  // Password strength checker
  useEffect(() => {
    const calculateStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength += 50;
      if (/[0-9]/.test(password)) strength += 50;
      return strength;
    };
    setPasswordStrength(calculateStrength(newPassword));
  }, [newPassword]);

  const getStrengthColor = (strength) => {
    if (strength < 50) return "bg-red-500";
    if (strength < 100) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength) => {
    if (strength < 50) return "Yếu";
    if (strength < 100) return "Trung bình";
    return "Mạnh";
  };

  // Step 1: Send reset link
  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${baseUrl}/auth/forgot-password`, {
        email,
      });
      if (response.data.message) {
        toast.success("Email đặt lại mật khẩu đã được gửi!");
        setEmailSent(true);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra! Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (passwordStrength < 50) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự!");
      return;
    }

    setLoading(true);

    try {
      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) {
        toast.error(
          "Thiếu token xác thực. Vui lòng kiểm tra lại link trong email!"
        );
        return;
      }

      const response = await axios.post(`${baseUrl}/auth/reset-password`, {
        token,
        newPassword,
      });

      if (response.data.message) {
        toast.success("Đặt lại mật khẩu thành công!");
        navigate("/login");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra! Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {step === 1 ? (
                    <Mail className="w-6 h-6" />
                  ) : (
                    <Key className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {step === 1 ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {step === 1
                      ? "Nhập email để nhận link đặt lại"
                      : "Tạo mật khẩu mới cho tài khoản"}
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30"
              >
                {step}/2
              </Badge>
            </div>
          </div>

          <div className="px-8 py-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Email Input */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {!emailSent ? (
                    <form onSubmit={handleSendResetLink} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                            placeholder="Nhập địa chỉ email của bạn"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Đang gửi...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Send className="w-4 h-4" />
                            <span>Gửi link đặt lại mật khẩu</span>
                          </div>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Email đã được gửi!
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Chúng tôi đã gửi link đặt lại mật khẩu đến{" "}
                        <strong>{email}</strong>
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                          <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div className="text-sm text-blue-700">
                            <p className="font-medium mb-1">Lưu ý:</p>
                            <ul className="space-y-1 text-left">
                              <li>• Link có hiệu lực trong 1 giờ</li>
                              <li>• Kiểm tra cả thư mục spam</li>
                              <li>• Chỉ sử dụng được 1 lần</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => setEmailSent(false)}
                        variant="outline"
                        className="w-full"
                      >
                        Gửi lại email
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 2: New Password */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleResetPassword} className="space-y-6">
                    {/* New Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                          placeholder="Nhập mật khẩu mới"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {/* Password Strength */}
                      {newPassword && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Độ mạnh mật khẩu:
                            </span>
                            <span
                              className={`font-medium ${
                                passwordStrength < 50
                                  ? "text-red-500"
                                  : passwordStrength < 100
                                  ? "text-yellow-500"
                                  : "text-green-500"
                              }`}
                            >
                              {getStrengthText(passwordStrength)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(
                                passwordStrength
                              )}`}
                              style={{ width: `${passwordStrength}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Xác nhận mật khẩu
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-200 ${
                            confirmPassword && newPassword !== confirmPassword
                              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                              : confirmPassword &&
                                newPassword === confirmPassword
                              ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                              : ""
                          }`}
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {/* Password Match Indicator */}
                      {confirmPassword && (
                        <div className="flex items-center space-x-2 text-sm">
                          {newPassword === confirmPassword ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-green-600">
                                Mật khẩu khớp
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <span className="text-red-600">
                                Mật khẩu không khớp
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        loading ||
                        !newPassword ||
                        !confirmPassword ||
                        newPassword !== confirmPassword ||
                        passwordStrength < 50
                      }
                      className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Đang xử lý...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Key className="w-4 h-4" />
                          <span>Đặt lại mật khẩu</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back to Login */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại đăng nhập
              </Button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Bảo mật tài khoản</p>
              <p>
                Chúng tôi khuyến nghị sử dụng mật khẩu có ít nhất 8 ký tự và bao
                gồm số.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ImprovedForgotPassword;
