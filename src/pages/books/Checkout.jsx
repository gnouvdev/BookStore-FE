/* eslint-disable no-unused-vars */
"use client"

import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import "../../styles/cart-checkout.css"
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaShieldAlt,
  FaCheckCircle,
  FaSpinner,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLock,
  FaShoppingCart,
} from "react-icons/fa"
import { RiSecurePaymentLine, RiTruckLine, RiShieldCheckLine } from "react-icons/ri"
import { useAuth } from "../../context/AuthContext"
import Swal from "sweetalert2"
import { useCreateOrderMutation } from "../../redux/features/orders/ordersApi"
import { clearCart } from "../../redux/features/cart/cartSlice"
import { useGetPaymentMethodsQuery, useCreateVNPayUrlMutation } from "../../redux/features/payments/paymentsApi"
import { useGetCurrentUserQuery } from "../../redux/features/users/userApi"
import baseUrl from "../../utils/baseURL"
import { useClearCartMutation } from "../../redux/features/cart/cartApi"
import gsap from "gsap"
import { t } from "i18next"

const EnhancedCheckoutPage = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [isChecked, setIsChecked] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const cartItems = useSelector((state) => state.cart.cartItems)
  const [createOrder, { isLoading }] = useCreateOrderMutation()

  const { data: paymentMethodsData, isLoading: isLoadingPayments, error: paymentError } = useGetPaymentMethodsQuery()

  const { data: userData, isLoading: isLoadingUser, error: userError } = useGetCurrentUserQuery()

  const paymentMethods = paymentMethodsData?.data || []
  const [createVNPayUrl] = useCreateVNPayUrlMutation()
  const [clearCartApi] = useClearCartMutation()

  const formRef = useRef(null)
  const stepsRef = useRef([])
  const summaryRef = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: currentUser?.displayName || "",
      email: currentUser?.email || "",
      city: currentUser?.address?.city || "",
      country: currentUser?.address?.country || "",
      state: currentUser?.address?.state || "",
      zipcode: currentUser?.address?.zipcode || "",
      phone: currentUser?.phone || "",
    },
  })

  const watchedFields = watch()

  // Enhanced animations
  useEffect(() => {
    if (formRef.current) {
      const tl = gsap.timeline()

      tl.fromTo(
        stepsRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
      ).fromTo(
        formRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
        "-=0.3",
      )
    }
  }, [])

  if (!currentUser) {
    navigate("/login")
    return null
  }

  const totalPrice = cartItems.reduce((acc, item) => {
    const price = item.price || 0
    const quantity = item.quantity || 1
    return acc + price * quantity
  }, 0)

  const handlePaymentMethodSelect = (method) => {
    setSelectedPayment(method)

    // Animate selection
    gsap.to(".payment-option", {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    })

    gsap.to(`[data-payment-id="${method._id}"]`, {
      scale: 1.02,
      duration: 0.2,
      ease: "power2.out",
    })
  }

  const validateStock = async () => {
    for (const item of cartItems) {
      try {
        const bookId = item._id || item.bookId
        const response = await fetch(`${baseUrl}/books/${bookId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch book: ${response.status}`)
        }

        const book = await response.json()
        const bookData = book.data || book

        if (!bookData || typeof bookData.quantity === "undefined") {
          throw new Error(`Invalid book data for ${bookId}`)
        }

        if (bookData.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${bookData.title || bookId}`)
        }
      } catch (error) {
        throw new Error(`Stock validation failed: ${error.message}`)
      }
    }
    return true
  }

  const onSubmit = async (data) => {
    if (!cartItems.length) {
      Swal.fire({
        title: "Error",
        text: "Your cart is empty!",
        icon: "error",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-xl",
        },
      })
      return
    }

    if (!selectedPayment) {
      Swal.fire({
        title: "Error",
        text: "Please select a payment method!",
        icon: "error",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-xl",
        },
      })
      return
    }

    if (!userData?.data?._id) {
      Swal.fire({
        title: "Error",
        text: "User data not loaded. Please try again.",
        icon: "error",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-xl",
        },
      })
      return
    }

    try {
      await validateStock()

      const orderItems = cartItems.map((item) => ({
        productId: item._id || item.bookId,
        quantity: item.quantity || 1,
      }))

      if (selectedPayment.code === "VNPAY") {
        try {
          const vnpayData = {
            orderItems,
            user: userData.data,
            shippingInfo: {
              name: data.name,
              email: currentUser?.email,
              phone: data.phone,
              address: {
                city: data.city,
                country: data.country || "",
                state: data.state || "",
                zipcode: data.zipcode || "",
              },
            },
            paymentMethodId: selectedPayment._id,
            returnUrl: `${window.location.origin}/vnpay/callback`,
          }

          const response = await createVNPayUrl(vnpayData).unwrap()

          if (response.paymentUrl) {
            window.location.href = response.paymentUrl
          } else {
            throw new Error("No payment URL received from VNPay")
          }
        } catch (error) {
          Swal.fire({
            title: "Payment Error",
            text: error.data?.message || "Failed to create VNPay payment. Please try again.",
            icon: "error",
            customClass: {
              popup: "rounded-2xl",
              confirmButton: "rounded-xl",
            },
          })
        }
      } else if (selectedPayment.code === "COD") {
        const orderData = {
          user: userData.data._id,
          name: data.name,
          email: currentUser?.email,
          address: {
            city: data.city,
            country: data.country || "",
            state: data.state || "",
            zipcode: data.zipcode || "",
          },
          phone: data.phone || "",
          productIds: orderItems,
          totalPrice: totalPrice,
          paymentMethod: selectedPayment._id,
          status: "pending",
          paymentStatus: "pending",
          paymentDetails: {
            paymentAmount: totalPrice,
            paymentCurrency: "VND",
          },
        }

        const order = await createOrder(orderData).unwrap()
        await clearCartApi()
        dispatch(clearCart())

        Swal.fire({
          title: "Order Confirmed! 🎉",
          text: "Your order has been placed successfully!",
          icon: "success",
          customClass: {
            popup: "rounded-2xl",
            confirmButton: "rounded-xl",
          },
        })

        navigate("/orders/thanks")
      } else {
        throw new Error("Unsupported payment method")
      }
    } catch (error) {
      console.error("API Error:", error)

      let errorMessage = "Failed to process the order"
      if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.status === "FETCH_ERROR") {
        errorMessage = "Network error. Please check your connection."
      } else if (error?.message) {
        errorMessage = error.message
      }

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "rounded-xl",
        },
      })
    }
  }

  if (isLoading || isLoadingPayments || isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-xl font-semibold text-gray-700">{t("cart.loading_checkout")}</p>
        </motion.div>
      </div>
    )
  }

  const supportedMethods = paymentMethods.filter((method) => method.isActive && ["COD", "VNPAY"].includes(method.code))

  const steps = [
    { id: 1, title: "Shipping Info", icon: FaUser },
    { id: 2, title: "Payment", icon: FaCreditCard },
    { id: 3, title: "Review", icon: FaCheckCircle },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t("cart.secure_checkout")}
          </h1>
          <p className="text-gray-600 text-lg">{t("cart.complete_your_order_safely_and_securely")}</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex justify-center">
            <div className="flex items-center space-x-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  ref={(el) => (stepsRef.current[index] = el)}
                  className="flex items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full ${
                      currentStep >= step.id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                    } transition-all duration-300`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`ml-3 font-medium ${currentStep >= step.id ? "text-blue-600" : "text-gray-500"}`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-1 mx-4 ${
                        currentStep > step.id ? "bg-blue-500" : "bg-gray-200"
                      } transition-all duration-300`}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Order Summary for Mobile */}
            <motion.div
              className="lg:hidden bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 mb-6 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">{t("cart.order_summary")}</h3>
              <div className="space-y-3">
                {cartItems.slice(0, 2).map((item) => (
                  <div key={item._id || item.bookId} className="flex items-center gap-3">
                    <img
                      src={item.coverImage || "/placeholder.svg?height=60&width=45"}
                      alt={item.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-sm text-gray-500">{t("cart.quantity")}: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                ))}
                {cartItems.length > 2 && (
                  <p className="text-sm text-gray-500 text-center">+{cartItems.length - 2} {t("cart.more_items")}</p>
                )}
                <hr className="border-gray-200" />
                <div className="flex justify-between font-bold text-lg">
                  <span>{t("cart.total")}:</span>
                  <span className="text-blue-600">{totalPrice.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>
            </motion.div>

            {/* Shipping Information */}
            <motion.div
              ref={formRef}
              className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-6 border border-white/20"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <FaUser className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{t("cart.shipping_information")}</h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaUser className="inline mr-2" />
                      {t("cart.full_name")} *
                    </label>
                    <input
                      {...register("name", { required: "Full Name is required" })}
                      type="text"
                      className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white transition-all duration-300 focus:outline-none ${
                        errors.name
                          ? "border-red-500"
                          : watchedFields.name
                            ? "border-green-500"
                            : "border-gray-200 focus:border-blue-500"
                      }`}
                      placeholder={t("cart.enter_your_full_name")}
                    />
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.name.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaEnvelope className="inline mr-2" />
                      {t("cart.email_address")}
                    </label>
                    <input
                      type="email"
                      disabled
                      value={currentUser?.email}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaPhone className="inline mr-2" />
                      {t("cart.phone_number")} *
                    </label>
                    <input
                      {...register("phone", {
                        required: "Phone is required",
                        pattern: {
                          value: /^\+?\d{10,15}$/,
                          message: t("cart.invalid_phone_number"),
                        },
                      })}
                      type="text"
                      className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white transition-all duration-300 focus:outline-none ${
                        errors.phone
                          ? "border-red-500"
                          : watchedFields.phone
                            ? "border-green-500"
                            : "border-gray-200 focus:border-blue-500"
                      }`}
                      placeholder={t("cart.enter_your_phone_number")}
                    />
                    {errors.phone && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.phone.message}
                      </motion.p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline mr-2" />
                      {t("cart.city")} *
                    </label>
                    <input
                      {...register("city", { required: "City is required" })}
                      type="text"
                      className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 focus:bg-white transition-all duration-300 focus:outline-none ${
                        errors.city
                          ? "border-red-500"
                          : watchedFields.city
                            ? "border-green-500"
                            : "border-gray-200 focus:border-blue-500"
                      }`}
                      placeholder={t("cart.enter_your_city")}
                    />
                    {errors.city && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.city.message}
                      </motion.p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("cart.state_province")}
                    </label>
                    <input
                      {...register("state")}
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-300 focus:outline-none"
                      placeholder={t("cart.enter_your_state")}
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("cart.country")}
                    </label>
                    <input
                      {...register("country")}
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-300 focus:outline-none"
                      placeholder={t("cart.enter_your_country")}
                    />
                  </div>

                  {/* Zipcode */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("cart.zipcode")}
                    </label>
                    <input
                      {...register("zipcode")}
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 transition-all duration-300 focus:outline-none"
                      placeholder={t("cart.enter_your_zipcode")}
                    />
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <FaCreditCard className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {t("cart.payment_method")}
                    </h3>
                  </div>

                  {isLoadingPayments ? (
                    <div className="flex items-center justify-center py-8">
                      <FaSpinner className="animate-spin text-2xl text-blue-500" />
                      <span className="ml-3 text-gray-600">{t("cart.loading_payment_methods")}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {supportedMethods.map((method) => (
                        <motion.label
                          key={method._id}
                          data-payment-id={method._id}
                          className={`payment-option flex items-center gap-4 border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                            selectedPayment?._id === method._id
                              ? "border-blue-500 bg-blue-50 shadow-lg"
                              : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method._id}
                            checked={selectedPayment?._id === method._id}
                            onChange={() => handlePaymentMethodSelect(method)}
                            className="sr-only"
                          />
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedPayment?._id === method._id ? "border-blue-500" : "border-gray-300"
                            }`}
                          >
                            {selectedPayment?._id === method._id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-3 h-3 bg-blue-500 rounded-full"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-4 flex-1">
                            <img
                              src={method.icon || "/placeholder.svg?height=40&width=40"}
                              alt={method.name}
                              className="w-10 h-10 object-contain"
                            />
                            <div>
                              <h4 className="font-semibold text-gray-800">{method.name}</h4>
                              <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                          </div>
                          {method.code === "VNPAY" && <RiSecurePaymentLine className="text-green-500 text-xl" />}
                          {method.code === "COD" && <FaMoneyBillWave className="text-green-500 text-xl" />}
                        </motion.label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Terms & Conditions */}
                <motion.div
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <input
                    type="checkbox"
                    id="terms"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                    {t("cart.i_agree_to_the")}{" "}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                      {t("cart.terms_and_conditions")}
                    </Link>{" "}
                    {t("cart.and")}{" "}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
                      {t("cart.privacy_policy")}
                    </Link>
                    {t("cart.i_understand_that_my_order_will_be_processed_according_to_these_terms")}.
                  </label>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!isChecked || isLoading || !selectedPayment}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-8 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      {t("cart.processing_order")}
                    </>
                  ) : (
                    <>
                      <FaLock />
                      {t("cart.place_secure_order")}
                      <FaShoppingCart />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              ref={summaryRef}
              className="hidden lg:block bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20 sticky top-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {t("cart.order_summary")}
              </h3>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <motion.div
                    key={item._id || item.bookId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <img
                      src={item.coverImage || "/placeholder.svg?height=60&width=45"}
                      alt={item.title}
                      className="w-12 h-16 object-cover rounded-lg shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                      <p className="text-sm text-gray-500">{t("cart.quantity")}: {item.quantity}</p>
                      <p className="text-sm font-semibold text-blue-600">
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>{t("cart.subtotal")} ({cartItems.length} {t("cart.items")})</span>
                  <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t("cart.shipping")}</span>
                  <span className="text-green-600 font-semibold">{t("cart.free")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t("cart.tax")}</span>
                  <span>{t("cart.included")}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>{t("cart.total")}</span>
                  <span className="text-blue-600">{totalPrice.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              {/* Security Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                  <RiShieldCheckLine className="text-green-600 text-xl" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      {t("cart.secure_payment")}
                    </p>
                    <p className="text-xs text-green-600">
                      {t("cart.ssl_encrypted_checkout")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <RiTruckLine className="text-blue-600 text-xl" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      {t("cart.fast_delivery")}
                    </p>
                    <p className="text-xs text-blue-600">
                        {t("cart.free_shipping_nationwide")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <FaShieldAlt className="text-purple-600 text-xl" />
                  <div>
                    <p className="text-sm font-semibold text-purple-800">
                      {t("cart.money_back_guarantee")}
                    </p>
                    <p className="text-xs text-purple-600">
                      {t("cart.return_policy")}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedCheckoutPage
