/* eslint-disable no-unused-vars */

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
  FaSpinner,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa"
import { RiUserLine, RiShieldCheckLine, RiMapPin2Line } from "react-icons/ri"
import { useAuth } from "../../context/AuthContext"
import axios from "axios"
import { uploadToCloudinary } from "../../utils/uploadService"
import { toast } from "react-hot-toast"
import gsap from "gsap"

const EnhancedProfile = () => {
  const { currentUser, setCurrentUser } = useAuth()
  const [profile, setProfile] = useState({})
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      country: "",
      zip: "",
    },
    photoURL: "",
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [hasChanges, setHasChanges] = useState(false)

  const profileRef = useRef(null)
  const formRef = useRef(null)
  const avatarRef = useRef(null)
  const fileInputRef = useRef(null)

  // Enhanced animations
  useEffect(() => {
    if (profileRef.current) {
      const tl = gsap.timeline()

      tl.fromTo(
        profileRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      ).fromTo(
        formRef.current?.children || [],
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
        "-=0.4",
      )
    }
  }, [profile])

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Please log in first.")
        window.location.href = "/login"
        return
      }

      setIsLoading(true)
      try {
        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.user) {
          setProfile(response.data.user)
        } else {
          throw new Error("No user data received")
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.")
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          window.location.href = "/login"
        } else {
          toast.error(error.response?.data?.message || "Failed to load profile data.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  useEffect(() => {
    if (profile && Object.keys(profile).length > 0) {
      const newFormData = {
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: {
          street: profile.address?.street || "",
          city: profile.address?.city || "",
          country: profile.address?.country || "",
          zip: profile.address?.zip || "",
        },
        photoURL: profile.photoURL || currentUser?.photoURL || "",
      }
      setFormData(newFormData)
      setPreviewUrl(newFormData.photoURL)
    }
  }, [profile, currentUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    setHasChanges(true)

    if (name.includes("address.")) {
      const field = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }

      setSelectedFile(file)
      setHasChanges(true)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target.result)

        // Animate avatar change
        if (avatarRef.current) {
          gsap.fromTo(
            avatarRef.current,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" },
          )
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setUploadProgress(0)

    try {
      let photoUrl = formData.photoURL

      if (selectedFile) {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 200)

        photoUrl = await uploadToCloudinary(selectedFile)
        clearInterval(progressInterval)
        setUploadProgress(100)

        if (!photoUrl) {
          toast.error("Failed to upload image.")
          setIsLoading(false)
          return
        }
      }

      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        { ...formData, photoURL: photoUrl },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )

      // Update states
      setProfile(response.data.user)
      setFormData((prev) => ({
        ...prev,
        photoURL: response.data.user.photoURL,
      }))

      // Update AuthContext
      const updatedUser = {
        ...currentUser,
        photoURL: response.data.user.photoURL || photoUrl,
        fullName: response.data.user.fullName,
        address: response.data.user.address,
        displayName: response.data.user.fullName,
        email: response.data.user.email,
        uid: currentUser.uid,
        role: currentUser.role,
      }

      setCurrentUser(updatedUser)

      // Update localStorage
      const userToStore = {
        ...updatedUser,
        token: localStorage.getItem("token"),
      }
      localStorage.setItem("user", JSON.stringify(userToStore))

      setHasChanges(false)
      setIsEditing(false)
      setSelectedFile(null)
      setUploadProgress(0)

      // Success animation
      if (formRef.current) {
        gsap.to(formRef.current, {
          scale: 1.02,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        })
      }

      toast.success("Profile updated successfully! 🎉")
    } catch (error) {
      console.error("Error updating profile:", error)
      const errorMessage = error.response?.data?.message || "Failed to update profile."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const handleCancel = () => {
    // Reset form data
    setFormData({
      fullName: profile.fullName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      address: {
        street: profile.address?.street || "",
        city: profile.address?.city || "",
        country: profile.address?.country || "",
        zip: profile.address?.zip || "",
      },
      photoURL: profile.photoURL || currentUser?.photoURL || "",
    })
    setPreviewUrl(profile.photoURL || currentUser?.photoURL || "")
    setSelectedFile(null)
    setHasChanges(false)
    setIsEditing(false)
  }

  if (isLoading && !profile.email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-xl font-semibold text-gray-700">Loading your profile...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
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

      <div ref={profileRef} className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            My Profile
          </h1>
          <p className="text-gray-600 text-lg">Manage your personal information and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 sticky top-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Avatar Section */}
              <div className="text-center mb-6">
                <motion.div
                  className="relative inline-block"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <motion.img
                      ref={avatarRef}
                      src={previewUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                      alt="Profile Avatar"
                      className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                      }}
                    />

                    {/* Upload Progress */}
                    <AnimatePresence>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"
                        >
                          <div className="text-white text-center">
                            <FaSpinner className="animate-spin text-2xl mb-2 mx-auto" />
                            <p className="text-sm">{uploadProgress}%</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Camera Button */}
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaCamera className="w-4 h-4" />
                    </motion.button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                </motion.div>

                <motion.h2
                  className="text-2xl font-bold text-gray-800 mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {formData.fullName || "User Name"}
                </motion.h2>

                <motion.p
                  className="text-gray-600 mt-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {formData.email || "user@example.com"}
                </motion.p>

                {/* Status Badge */}
                <motion.div
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <RiShieldCheckLine className="w-4 h-4" />
                  Verified Account
                </motion.div>
              </div>

              {/* Quick Stats */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <FaShieldAlt className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Account Security</p>
                      <p className="text-sm text-gray-600">Two-factor authentication enabled</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <FaCheckCircle className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Profile Complete</p>
                      <p className="text-sm text-gray-600">85% profile completion</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            <motion.div
              ref={formRef}
              className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Form Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <RiUserLine className="text-white text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                </div>

                <div className="flex items-center gap-3">
                  {!isEditing ? (
                    <motion.button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaEdit />
                      Edit Profile
                    </motion.button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={handleCancel}
                        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaTimes />
                        Cancel
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaUser className="inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                        isEditing
                          ? "bg-white border-gray-200 focus:border-blue-500"
                          : "bg-gray-50 border-gray-200 text-gray-600"
                      }`}
                      placeholder="Enter your full name"
                    />
                  </motion.div>

                  {/* Email */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaEnvelope className="inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                      placeholder="Email address"
                    />
                  </motion.div>

                  {/* Phone */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaPhone className="inline mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                        isEditing
                          ? "bg-white border-gray-200 focus:border-blue-500"
                          : "bg-gray-50 border-gray-200 text-gray-600"
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </motion.div>
                </div>

                {/* Address Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <RiMapPin2Line className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Address Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Street */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaMapMarkerAlt className="inline mr-2" />
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                          isEditing
                            ? "bg-white border-gray-200 focus:border-blue-500"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                        placeholder="Enter your street address"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                          isEditing
                            ? "bg-white border-gray-200 focus:border-blue-500"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                        placeholder="Enter your city"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                          isEditing
                            ? "bg-white border-gray-200 focus:border-blue-500"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                        placeholder="Enter your country"
                      />
                    </div>

                    {/* Zip Code */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Zip Code</label>
                      <input
                        type="text"
                        name="address.zip"
                        value={formData.address.zip}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                          isEditing
                            ? "bg-white border-gray-200 focus:border-blue-500"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                        placeholder="Enter zip code"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200"
                    >
                      <motion.button
                        type="button"
                        onClick={handleCancel}
                        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaTimes />
                        Cancel
                      </motion.button>

                      <motion.button
                        type="submit"
                        disabled={isLoading || !hasChanges}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 transition-all duration-300 shadow-lg"
                        whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.4)" }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isLoading ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaSave />
                            Save Changes
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedProfile
