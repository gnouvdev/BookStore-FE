/* eslint-disable no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle, Package, Truck, Home, Clock, Mail, Phone, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { t } from "i18next"

const ImprovedThanksPage = () => {
  const [orderNumber] = useState(() => Math.floor(Math.random() * 1000000))
  const [currentStep, setCurrentStep] = useState(0)

  // Simulate order processing steps
  const steps = [
    { icon: CheckCircle, label: "Order Confirmed", completed: true },
    { icon: Package, label: "Processing", completed: false },
    { icon: Truck, label: "Shipping", completed: false },
    { icon: Home, label: "Delivered", completed: false },
  ]

  useEffect(() => {
    // Simulate step progression
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    }, 2000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        {/* Success Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-12 text-white text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-bold mb-4"
            >
              Thank You for Your Order!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-green-100 text-lg"
            >
              {t("thank.Your order has been successfully placed and is being processed")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-6"
            >
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg">Order #{orderNumber}</Badge>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Order Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mb-8"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Order Status</h3>
              <div className="flex justify-between items-center">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                        index <= currentStep ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-sm mt-2 transition-colors duration-500 ${
                        index <= currentStep ? "text-green-600 font-medium" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    {index < steps.length - 1 && (
                      <div
                        className={`absolute h-0.5 w-16 mt-6 transition-colors duration-500 ${
                          index < currentStep ? "bg-green-500" : "bg-gray-200"
                        }`}
                        style={{ left: `${(index + 1) * 25}%`, transform: "translateX(-50%)" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Information Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="grid md:grid-cols-2 gap-6 mb-8"
            >
              {/* Processing Time */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900">
                    {t("thank.Processing Time")}
                  </h4>
                </div>
                <p className="text-gray-600 text-sm">
                  {t("thank.Your order will be processed within 1-2 business days. You'll receive a confirmation email shortly.")}
                </p>
              </div>

              {/* Contact Support */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900">
                    {t("thank.Need Help?")}
                  </h4>
                </div>
                <p className="text-gray-600 text-sm">
                  {t("thank.Contact our support team if you have any questions about your order.")}
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-1 text-sm text-purple-600">
                    <Mail className="w-4 h-4" />
                    <span>quocvuong132003@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-purple-600">
                    <Phone className="w-4 h-4" />
                    <span>0909090909</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                asChild
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Link to="/">
                  <Home className="w-5 h-5 mr-2" />
                  Return to Home
                </Link>
              </Button>

              <Button asChild variant="outline" className="flex-1 h-12 border-gray-200 hover:bg-gray-50 rounded-xl">
                <Link to="/orders">
                  <Package className="w-5 h-5 mr-2" />
                  View Orders
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          className="mt-8 text-center"
        >
          <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-2">What's Next?</h4>
            <p className="text-gray-600 text-sm">
              You'll receive an email confirmation with your order details and tracking information once your order
              ships.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ImprovedThanksPage
