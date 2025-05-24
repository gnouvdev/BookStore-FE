/* eslint-disable no-unused-vars */

import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FaGoogle, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaSpinner } from "react-icons/fa"
import { RiBookOpenLine, RiSparklingFill, RiShieldCheckLine } from "react-icons/ri"
import { useForm } from "react-hook-form"
import { useAuth } from "./../context/AuthContext"
import { toast } from "react-hot-toast"
import axios from "axios"
import gsap from "gsap"
import "../styles/auth.css"

const EnhancedLogin = () => {
  const { loginUser, signInWithGoogle, setCurrentUser } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const formRef = useRef(null)
  const logoRef = useRef(null)
  const backgroundRef = useRef(null)

  const email = watch("email")
  const password = watch("password")

  // Enhanced animations
  useEffect(() => {
    const tl = gsap.timeline()

    tl.fromTo(
      backgroundRef.current,
      { opacity: 0, scale: 1.1 },
      { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" },
    )
      .fromTo(
        logoRef.current,
        { y: -50, opacity: 0, rotationY: -90 },
        { y: 0, opacity: 1, rotationY: 0, duration: 1, ease: "back.out(1.7)" },
        "-=1",
      )
      .fromTo(
        formRef.current?.children || [],
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
        "-=0.5",
      )
  }, [])

  // Helper functions
  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data.user
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  const createCleanUserObject = (user, profileData, role) => {
    const { email, uid, photoURL: firebasePhotoURL } = user

    let finalPhotoURL = null
    if (profileData?.photoURL) {
      finalPhotoURL = profileData.photoURL
    } else if (firebasePhotoURL) {
      finalPhotoURL = firebasePhotoURL
    } else {
      finalPhotoURL = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
    }

    return {
      email,
      uid,
      role,
      photoURL: finalPhotoURL,
      displayName: profileData?.fullName || user.displayName || null,
      fullName: profileData?.fullName || null,
      address: profileData?.address || null,
    }
  }

  // Enhanced login handler
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // 1. Firebase authentication
      const result = await loginUser(data.email, data.password)
      const user = result.user

      // 2. Get Firebase token
      const idToken = await user.getIdToken()

      // 3. Backend authentication
      const response = await axios.post("http://localhost:5000/api/auth/login", { idToken })
      const { token, role = "user" } = response.data

      localStorage.setItem("token", token)

      // 4. Fetch user profile
      const profileData = await fetchUserProfile(token)

      // 5. Create clean user object
      const cleanUser = createCleanUserObject(user, profileData, role)

      // 6. Save to localStorage
      localStorage.setItem("user", JSON.stringify(cleanUser))

      // 7. Update context
      setCurrentUser(cleanUser)

      // Success animation
      gsap.to(formRef.current, {
        scale: 1.05,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      })

      toast.success("Đăng nhập thành công! 🎉")
      setTimeout(() => navigate("/"), 1000)
    } catch (error) {
      console.error("Login error:", error)

      // Error animation
      gsap.to(formRef.current, {
        x: [-10, 10, -10, 10, 0],
        duration: 0.5,
        ease: "power2.inOut",
      })

      if (error.code === "auth/user-not-found") {
        toast.error("Email chưa được đăng ký. Vui lòng đăng ký trước.")
      } else if (error.code === "auth/wrong-password") {
        toast.error("Mật khẩu không đúng. Vui lòng thử lại.")
      } else {
        toast.error("Đăng nhập thất bại. Vui lòng thử lại.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Enhanced Google sign-in
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      const result = await signInWithGoogle()
      const user = result.user
      const idToken = await user.getIdToken()

      const response = await axios.post("http://localhost:5000/api/auth/google", { idToken })
      const { token, role = "user" } = response.data

      localStorage.setItem("token", token)

      const profileData = await fetchUserProfile(token)
      const cleanUser = createCleanUserObject(user, profileData, role)

      localStorage.setItem("user", JSON.stringify(cleanUser))
      setCurrentUser(cleanUser)

      toast.success("Đăng nhập bằng Google thành công! 🎉")
      setTimeout(() => navigate("/profile"), 1000)
    } catch (error) {
      console.error("Google sign-in error:", error)
      toast.error("Đăng nhập bằng Google thất bại!")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background */}
      <div ref={backgroundRef} className="absolute inset-0">
        {/* Floating Elements */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-300/30 to-purple-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-300/30 to-pink-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full"
        >
          {/* Enhanced Logo Section */}
          <motion.div ref={logoRef} className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl mb-4"
              animate={{
                rotateY: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotateY: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
              }}
            >
              <RiBookOpenLine className="text-white text-3xl" />
            </motion.div>

            <motion.h1
              className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Welcome Back
            </motion.h1>

            <motion.p
              className="text-gray-600 flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <RiSparklingFill className="text-yellow-500" />
              Sign in to your BookStore account
            </motion.p>
          </motion.div>

          {/* Enhanced Form */}
          <motion.div
            ref={formRef}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("email", {
                      required: "Vui lòng nhập email",
                      pattern: {
                        value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                        message: "Email không hợp lệ",
                      },
                    })}
                    type="email"
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white transition-all duration-300 focus:outline-none ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : email
                          ? "border-green-500 focus:border-green-500"
                          : "border-gray-200 focus:border-blue-500"
                    }`}
                    placeholder="Enter your email"
                  />
                  <AnimatePresence>
                    {email && !errors.email && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        <RiShieldCheckLine className="h-5 w-5 text-green-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-sm mt-2 flex items-center gap-1"
                    >
                      ⚠️ {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("password", {
                      required: "Vui lòng nhập mật khẩu",
                      minLength: {
                        value: 6,
                        message: "Mật khẩu phải có ít nhất 6 ký tự",
                      },
                    })}
                    type={showPassword ? "text" : "password"}
                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white transition-all duration-300 focus:outline-none ${
                      errors.password
                        ? "border-red-500 focus:border-red-500"
                        : password
                          ? "border-green-500 focus:border-green-500"
                          : "border-gray-200 focus:border-blue-500"
                    }`}
                    placeholder="Enter your password"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </motion.button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-sm mt-2 flex items-center gap-1"
                    >
                      ⚠️ {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <motion.label
                  className="flex items-center cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                      rememberMe ? "bg-blue-500 border-blue-500" : "border-gray-300"
                    }`}
                  >
                    {rememberMe && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-sm text-gray-700">Remember me</span>
                </motion.label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <motion.div
              className="relative my-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </motion.div>

            {/* Google Sign In */}
            <motion.button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50 transition-all duration-300 shadow-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              {isGoogleLoading ? (
                <FaSpinner className="animate-spin text-xl" />
              ) : (
                <FaGoogle className="text-xl text-red-500" />
              )}
              {isGoogleLoading ? "Connecting..." : "Continue with Google"}
            </motion.button>

            {/* Sign Up Link */}
            <motion.p
              className="text-center text-gray-600 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Sign up
              </Link>
            </motion.p>

            {/* Footer */}
            <motion.p
              className="text-center text-gray-400 text-xs mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              ©2025 BookStore. All rights reserved.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default EnhancedLogin
