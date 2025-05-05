import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useAuth } from "./../context/AuthContext";
import { toast } from "react-hot-toast";
import axios from "axios";
import { setToken } from "../firebase/tokenStorage";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const Login = () => {
  const [message, setMessage] = useState("");
  const { loginUser, googleLogin } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (!data.email || !data.password) {
      toast.error("Email và mật khẩu là bắt buộc");
      return;
    }

    try {
      const user = await loginUser(data.email, data.password);
      if (!user || !user.getIdToken) {
        throw new Error("Invalid user object returned from login");
      }

      const idToken = await user.getIdToken();
      console.log("Firebase idToken:", idToken); // Log để debug

      // Gửi idToken đến backend
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { idToken }
      );

      const { token, role = "user" } = response.data;
      if (role !== "user" && role !== "admin") {
        throw new Error("Invalid role for this login");
      }

      console.log("JWT token:", token); // Log để debug
      setToken(token);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ email: data.email, role }));
      toast.success("Đăng nhập thành công!");
      navigate(role === "admin" ? "/dashboard" : "/profile");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Email hoặc mật khẩu không hợp lệ";
      toast.error(errorMessage);
      setMessage("Đăng nhập thất bại, vui lòng thử lại!");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await googleLogin();
      if (!user || !user.getIdToken) {
        throw new Error("Invalid user object returned from Google login");
      }

      const idToken = await user.getIdToken();
      console.log("Google idToken:", idToken); // Log để debug

      const response = await axios.post(
        "http://localhost:5000/api/auth/google",
        { idToken }
      );

      const { token, role = "user" } = response.data;
      if (role !== "user" && role !== "admin") {
        throw new Error("Invalid role for this login");
      }

      console.log("JWT token:", token); // Log để debug
      setToken(token);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ email: user.email, role }));
      toast.success("Đăng nhập bằng Google thành công!");
      navigate(role === "admin" ? "/dashboard" : "/profile");
    } catch (error) {
      console.error("Lỗi đăng nhập Google:", error);
      const errorMessage =
        error.response?.data?.message || "Đăng nhập bằng Google thất bại";
      toast.error(errorMessage);
      setMessage("Đăng nhập thất bại, vui lòng thử lại!");
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex justify-center items-center">
      <div className="w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">Vui lòng đăng nhập</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              {...register("email", { required: "Email là bắt buộc" })}
              type="email"
              id="email"
              placeholder="Địa chỉ email"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow"
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic">{errors.email.message}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Mật khẩu
            </label>
            <input
              {...register("password", { required: "Mật khẩu là bắt buộc" })}
              type="password"
              id="password"
              placeholder="Mật khẩu"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow"
            />
            {errors.password && (
              <p className="text-red-500 text-xs italic">{errors.password.message}</p>
            )}
          </div>
          {message && (
            <p className="text-red-500 text-xs italic mb-3">{message}</p>
          )}
          <div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none"
            >
              Đăng nhập
            </button>
          </div>
        </form>

        <p className="align-baseline font-medium mt-4 text-sm">
          Chưa có tài khoản? Vui lòng{" "}
          <Link to="/register" className="text-blue-500 hover:text-blue-700">
            Đăng ký
          </Link>
        </p>

        <div className="mt-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex flex-wrap gap-1 items-center justify-center bg-secondary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
          >
            <FaGoogle className="mr-2" />
            Đăng nhập bằng Google
          </button>
        </div>

        <p className="mt-5 text-center text-gray-500 text-xs">
          ©2025 Book Store. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;