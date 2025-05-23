import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import baseUrl from "../utils/baseURL";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaUserShield, FaLock } from "react-icons/fa";
import gsap from "gsap";

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

  // Refs cho animation
  const containerRef = useRef(null);
  const iconRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const formRef = useRef(null);
  const buttonRef = useRef(null);

  // Animation khi component mount
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Đảm bảo các phần tử hiển thị trước khi animate
    gsap.set(
      [
        containerRef.current,
        iconRef.current,
        titleRef.current,
        subtitleRef.current,
        formRef.current,
        buttonRef.current,
      ],
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: 0,
      }
    );

    tl.from(containerRef.current, {
      duration: 0.8,
      y: 50,
      opacity: 0,
      clearProps: "all",
    })
      .from(
        iconRef.current,
        {
          duration: 0.5,
          scale: 0,
          rotation: -180,
          clearProps: "all",
        },
        "-=0.4"
      )
      .from(
        titleRef.current,
        {
          duration: 0.5,
          y: 30,
          opacity: 0,
          clearProps: "all",
        },
        "-=0.3"
      )
      .from(
        subtitleRef.current,
        {
          duration: 0.5,
          y: 20,
          opacity: 0,
          clearProps: "all",
        },
        "-=0.3"
      )
      .from(
        formRef.current,
        {
          duration: 0.5,
          y: 20,
          opacity: 0,
          clearProps: "all",
        },
        "-=0.3"
      )
      .from(
        buttonRef.current,
        {
          duration: 0.5,
          y: 20,
          opacity: 0,
          clearProps: "all",
        },
        "-=0.3"
      );
  }, []);

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const { email, password } = data;
    console.log("Dữ liệu đăng nhập:", data);

    try {
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
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        const storedToken = localStorage.getItem("token");
        console.log("Token đã lưu:", storedToken);

        if (!storedToken) {
          throw new Error("Failed to store authentication token");
        }

        // Animation khi đăng nhập thành công
        gsap.to(buttonRef.current, {
          scale: 1.1,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            toast.success("Đăng nhập admin thành công!");
            navigate("/dashboard");
          },
        });
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

      // Animation khi đăng nhập thất bại
      gsap.to(buttonRef.current, {
        x: [-10, 10, -10, 10, 0],
        duration: 0.5,
        ease: "power1.inOut",
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div
        ref={containerRef}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl"
      >
        <div className="text-center">
          <div
            ref={iconRef}
            className="mx-auto h-20 w-20 bg-indigo-600 rounded-full flex items-center justify-center mb-4"
          >
            <FaUserShield className="h-10 w-10 text-white" />
          </div>
          <h2
            ref={titleRef}
            className="text-3xl font-extrabold text-gray-900 mb-2"
          >
            Đăng nhập Admin
          </h2>
          <p ref={subtitleRef} className="text-gray-600 text-sm">
            Vui lòng đăng nhập để truy cập vào trang quản trị
          </p>
        </div>

        <form
          ref={formRef}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUserShield className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register("email", {
                  required: "Email là bắt buộc",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email không hợp lệ",
                  },
                })}
                type="email"
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 pl-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register("password", {
                  required: "Mật khẩu là bắt buộc",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                })}
                type="password"
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Mật khẩu"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {message && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{message}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              ref={buttonRef}
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FaLock className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
              </span>
              Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
