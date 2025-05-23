import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaLock } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useAuth } from "./../context/AuthContext";
import { toast } from "react-hot-toast";
import axios from "axios";

const Login = () => {
  const { loginUser, signInWithGoogle, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hàm helper để lấy thông tin người dùng từ profile API
  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Profile API response:", response.data);
      return response.data.user;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Hàm helper để tạo đối tượng người dùng sạch
  const createCleanUserObject = (user, profileData, role) => {
    const { email, uid, photoURL: firebasePhotoURL } = user;

    let finalPhotoURL = null;
    if (profileData?.photoURL) {
      finalPhotoURL = profileData.photoURL;
    } else if (firebasePhotoURL) {
      finalPhotoURL = firebasePhotoURL;
    } else {
      finalPhotoURL =
        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
    }

    return {
      email,
      uid,
      role,
      photoURL: finalPhotoURL,
      displayName: profileData?.fullName || user.displayName || null,
      fullName: profileData?.fullName || null,
      address: profileData?.address || null,
    };
  };

  // Login user
  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    setIsSubmitting(true);
    try {
      // 1. Đăng nhập với Firebase
      const result = await loginUser(data.email, data.password);
      const user = result.user;

      // 2. Lấy token từ Firebase
      const idToken = await user.getIdToken();
      console.log("Firebase idToken:", idToken);

      // 3. Đăng nhập với backend
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { idToken }
      );

      const { token, role = "user" } = response.data;
      console.log("JWT token:", token);
      localStorage.setItem("token", token);

      // 4. Lấy thông tin người dùng từ profile API
      const profileData = await fetchUserProfile(token);
      console.log("Profile data:", profileData);

      // 5. Tạo đối tượng người dùng sạch
      const cleanUser = createCleanUserObject(user, profileData, role);
      console.log("Clean user object:", cleanUser);

      // 6. Lưu vào localStorage
      localStorage.setItem("user", JSON.stringify(cleanUser));

      // 7. Cập nhật currentUser trong AuthContext
      setCurrentUser(cleanUser);

      toast.success("Đăng nhập thành công!");
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === "auth/user-not-found") {
        toast.error("Email chưa được đăng ký. Vui lòng đăng ký trước.");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Mật khẩu không đúng. Vui lòng thử lại.");
      } else {
        toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      const idToken = await user.getIdToken();
      console.log("Google idToken:", idToken);

      const response = await axios.post(
        "http://localhost:5000/api/auth/google",
        { idToken }
      );

      const { token, role = "user" } = response.data;
      console.log("JWT token:", token);
      localStorage.setItem("token", token);

      // Lấy thông tin người dùng từ profile API
      const profileData = await fetchUserProfile(token);
      console.log("Profile data:", profileData);

      // Tạo đối tượng người dùng sạch
      const cleanUser = createCleanUserObject(user, profileData, role);
      console.log("Clean user object:", cleanUser);

      // Lưu vào localStorage
      localStorage.setItem("user", JSON.stringify(cleanUser));

      // Cập nhật currentUser trong AuthContext
      setCurrentUser(cleanUser);

      toast.success("Đăng nhập bằng Google thành công!");
      navigate("/profile");
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Đăng nhập bằng Google thất bại!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Đăng nhập</h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              {...register("email", {
                required: "Vui lòng nhập email",
                pattern: {
                  value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                  message: "Email không hợp lệ",
                },
              })}
              type="email"
              id="email"
              placeholder="Địa chỉ email"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow"
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                {...register("password", {
                  required: "Vui lòng nhập mật khẩu",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                })}
                className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none disabled:opacity-50"
            >
              {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </div>
        </form>

        <p className="align-baseline font-medium mt-4 text-sm">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-500 hover:text-blue-700">
            Đăng ký
          </Link>
        </p>

        {/* Google sign-in */}
        <div className="mt-4">
          <button
            onClick={handleGoogleSignIn}
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
