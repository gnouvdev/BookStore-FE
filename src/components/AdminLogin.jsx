/* eslint-disable no-unused-vars */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../context/AuthContext";

// Use environment variable for baseUrl
const baseUrl = `${import.meta.env.VITE_API_URL}/api`;

const ImprovedAdminLogin = () => {
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStep, setLoginStep] = useState("form"); // "form", "loading", "success"
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const watchedEmail = watch("email");
  const watchedPassword = watch("password");

  const onSubmit = async (data) => {
    const { email, password } = data;
    setIsLoading(true);
    setLoginStep("loading");
    setMessage("");

    try {
      // Clear previous auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Call API to login
      const response = await axios.post(
        `${baseUrl}/users/admin`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response từ /api/users/admin:", response.data);

      const { token, user } = response.data;

      if (token && user?.role === "admin") {
        // Create clean user object
        const cleanUser = {
          ...user,
          uid: user.id,
          firebaseId: user.id,
          role: "admin",
        };

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(cleanUser));
        setCurrentUser(cleanUser);

        setLoginStep("success");

        // Success animation and navigation
        setTimeout(() => {
          toast.success("Đăng nhập admin thành công!");
          navigate("/dashboard");
        }, 1500);
      } else {
        throw new Error("Bạn không được phép truy cập dashboard admin!");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Đăng nhập thất bại, vui lòng thử lại!";
      setMessage(errorMessage);
      setLoginStep("form");
      toast.error(errorMessage);

      // Clear auth data on error
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-8 py-8 text-white relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="mx-auto h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm"
              >
                <Shield className="h-8 w-8 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold mb-2"
              >
                Admin Dashboard
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-indigo-100 text-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Secure Administrative Access
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-4"
              >
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Admin Only
                </Badge>
              </motion.div>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 py-8">
            <AnimatePresence mode="wait">
              {loginStep === "form" && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        {...register("email", {
                          required: "Email là bắt buộc",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Email không hợp lệ",
                          },
                        })}
                        type="email"
                        className={`pl-10 h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all duration-200 ${
                          errors.email
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : ""
                        } ${watchedEmail ? "border-green-300" : ""}`}
                        placeholder="admin@example.com"
                      />
                      {watchedEmail && !errors.email && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.email.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        {...register("password", {
                          required: "Mật khẩu là bắt buộc",
                          minLength: {
                            value: 6,
                            message: "Mật khẩu phải có ít nhất 6 ký tự",
                          },
                        })}
                        type={showPassword ? "text" : "password"}
                        className={`pl-10 pr-10 h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all duration-200 ${
                          errors.password
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : ""
                        } ${
                          watchedPassword && !errors.password
                            ? "border-green-300"
                            : ""
                        }`}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.password.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Error Message */}
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-50 border border-red-200 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Authentication Failed
                          </p>
                          <p className="text-xs text-red-600 mt-1">{message}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Authenticating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>Access Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </motion.form>
              )}

              {loginStep === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Verifying Credentials
                  </h3>
                  <p className="text-gray-500">
                    Please wait while we authenticate your access...
                  </p>
                  <div className="mt-6 flex justify-center">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-indigo-500 rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {loginStep === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Authentication Successful!
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Redirecting to admin dashboard...
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center"
        >
          <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span>Protected by enterprise-grade security</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              All admin sessions are encrypted and monitored for security
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ImprovedAdminLogin;
