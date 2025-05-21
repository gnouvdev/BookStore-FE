import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import baseUrl from "../utils/baseURL";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AdminLogin = () => {
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const { email, password } = data;
    console.log("Dữ liệu đăng nhập:", data);

    try {
      // Clear any existing tokens and user data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

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
        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Verify token is stored
        const storedToken = localStorage.getItem("token");
        console.log("Token đã lưu:", storedToken);

        if (!storedToken) {
          throw new Error("Failed to store authentication token");
        }

        toast.success("Đăng nhập admin thành công!");
        navigate("/dashboard");
      } else {
        setMessage("Bạn không được phép truy cập dashboard admin!");
        toast.error("Không phải tài khoản admin!");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Đăng nhập thất bại, vui lòng thử lại!";
      setMessage(errorMessage);
      console.error("Lỗi đăng nhập:", error.response?.data || error);
      toast.error(errorMessage);

      // Clear any partial data on error
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập Admin
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                {...register("email", {
                  required: "Email là bắt buộc",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email không hợp lệ",
                  },
                })}
                type="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
              <input
                {...register("password", {
                  required: "Mật khẩu là bắt buộc",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                })}
                type="password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {message && (
            <div className="text-red-500 text-sm text-center">{message}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
