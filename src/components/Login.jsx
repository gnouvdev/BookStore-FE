import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
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
      const response = await axios.get("http://localhost:5000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
      finalPhotoURL = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
    }

    return {
      email,
      uid,
      role,
      photoURL: finalPhotoURL,
      displayName: profileData?.fullName || user.displayName || null,
      fullName: profileData?.fullName || null,
      address: profileData?.address || null
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
    <div className="h-[calc(100vh-120px)] flex justify-center items-center">
      <div className="w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">Đăng nhập</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
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

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Mật khẩu
            </label>
            <input
              {...register("password", {
                required: "Vui lòng nhập mật khẩu",
                minLength: {
                  value: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự",
                },
              })}
              type="password"
              id="password"
              placeholder="Mật khẩu"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow"
            />
            {errors.password && (
              <p className="text-red-500 text-xs italic">
                {errors.password.message}
              </p>
            )}
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