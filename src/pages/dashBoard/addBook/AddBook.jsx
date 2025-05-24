/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  FaBook,
  FaUser,
  FaImage,
  FaTag,
  FaDollarSign,
  FaLanguage,
  FaChartLine,
  FaCheck,
  FaSpinner,
  FaPlus,
  FaCloudUploadAlt,
} from "react-icons/fa";
import { RiPriceTag3Line } from "react-icons/ri";
import { useAddBookMutation } from "../../../redux/features/books/booksApi";
import { useGetCategoriesQuery } from "../../../redux/features/categories/categoriesApi";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "../../../utils/uploadService";
import axios from "axios";
import AsyncSelect from "react-select/async";
import debounce from "lodash/debounce";
import baseUrl from "./../../../utils/baseURL";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

const EnhancedAddBook = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const formRef = useRef(null);
  const stepsRef = useRef([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm();

  const [addBook, { isLoading }] = useAddBookMutation();
  const {
    data: categoriesData,
    isError: isCategoriesError,
    error: categoriesError,
  } = useGetCategoriesQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [coverImage, setCoverImage] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("Tiếng Anh");
  const [imagePreview, setImagePreview] = useState("");

  // Watch form values for validation
  const watchedFields = watch();

  // Enhanced animations
  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }

    stepsRef.current.forEach((step, index) => {
      if (step) {
        gsap.fromTo(
          step,
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            delay: index * 0.1,
            ease: "power2.out",
          }
        );
      }
    });
  }, []);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin");
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/users/verify-token`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.valid && response.data.user.role === "admin") {
          setIsAuthenticated(true);
        } else {
          throw new Error("Not authorized");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        if (error.response?.status === 404) {
          console.error(
            "Verify token endpoint not found. Please check the API URL."
          );
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/admin");
      }
    };

    checkAuth();
  }, [navigate]);

  // Handle authentication errors
  if (isCategoriesError) {
    if (categoriesError?.status === 401 || categoriesError?.status === 403) {
      Swal.fire({
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
        icon: "error",
        confirmButtonText: "Go to Login",
        background: "#fff",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "bg-blue-500 hover:bg-blue-600 rounded-xl px-6 py-2",
        },
      }).then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/admin");
      });
      return null;
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4"
        >
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Categories
          </h2>
          <p className="text-gray-600">
            {categoriesError.data?.message || "Failed to load categories"}
          </p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const categories =
    categoriesData?.map((category) => ({
      value: category._id,
      label: category.name,
    })) || [];

  const debouncedLoadOptions = debounce(async (inputValue) => {
    if (!inputValue) return [];

    try {
      const response = await axios.get(
        `${baseUrl}/authors/search?name=${inputValue}`
      );

      if (response.data && Array.isArray(response.data)) {
        return response.data.map((author) => ({
          value: author._id,
          label: author.name,
        }));
      }
      console.error("Invalid authors data format:", response.data);
      return [];
    } catch (error) {
      console.error("Error loading author options:", error);
      toast.error(error.response?.data?.message || "Failed to load authors");
      return [];
    }
  }, 300);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const url = await uploadToCloudinary(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (url) {
        setCoverImage(url);
        toast.success("Image uploaded successfully!", {
          icon: "🎉",
          style: {
            borderRadius: "12px",
            background: "#10B981",
            color: "#fff",
          },
        });
      } else {
        toast.error("Failed to upload image.");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("An error occurred while uploading the image.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleTagsChange = (event) => {
    setTags(event.target.value);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return (
          watchedFields.title && selectedAuthor && watchedFields.description
        );
      case 2:
        return Boolean(watchedFields.category);
      case 3:
        return watchedFields.newPrice && watchedFields.quantity;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    } else {
      let errorMessage = "Please fill in all required fields:";
      if (currentStep === 1) {
        if (!watchedFields.title) errorMessage += "\n- Title";
        if (!selectedAuthor) errorMessage += "\n- Author";
        if (!watchedFields.description) errorMessage += "\n- Description";
      } else if (currentStep === 2) {
        if (!watchedFields.category) errorMessage += "\n- Category";
      } else if (currentStep === 3) {
        if (!watchedFields.newPrice) errorMessage += "\n- Sale Price";
        if (!watchedFields.quantity) errorMessage += "\n- Quantity";
      }
      toast.error(errorMessage);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast.error("Please fill in all required fields before submitting");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required. Please log in again.");
      navigate("/admin");
      return;
    }

    const newBookData = {
      ...data,
      coverImage: coverImage,
      author: selectedAuthor ? selectedAuthor.value : null,
      category: data.category,
      publish: data.publish,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
      language: language,
      price: {
        oldPrice: Number.parseFloat(data.oldPrice) || 0,
        newPrice: Number.parseFloat(data.newPrice),
      },
    };

    console.log("Submitting book data:", newBookData);
    console.log("Using token:", token);

    try {
      console.log("Calling addBook mutation...");
      const result = await addBook(newBookData).unwrap();
      console.log("Mutation result:", result);

      if (result) {
        Swal.fire({
          title: "🎉 Book Added Successfully!",
          text: "Your book has been uploaded and is now available in the store.",
          icon: "success",
          confirmButtonText: "Add Another Book",
          showCancelButton: true,
          cancelButtonText: "Go to Dashboard",
          background: "#fff",
          customClass: {
            popup: "rounded-2xl",
            confirmButton:
              "bg-green-500 hover:bg-green-600 rounded-xl px-6 py-2",
            cancelButton: "bg-gray-500 hover:bg-gray-600 rounded-xl px-6 py-2",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            reset();
            setCoverImage("");
            setSelectedAuthor(null);
            setTags("");
            setLanguage("Tiếng Anh");
            setImagePreview("");
            setCurrentStep(1);
          } else {
            navigate("/dashboard/manage-books");
          }
        });
      }
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        data: error.data,
        status: error.status,
        originalError: error,
      });

      if (error?.status === 401 || error?.status === 403) {
        Swal.fire({
          title: "Session Expired",
          text: "Your session has expired. Please log in again.",
          icon: "error",
          confirmButtonText: "Go to Login",
          background: "#fff",
          customClass: {
            popup: "rounded-2xl",
            confirmButton: "bg-blue-500 hover:bg-blue-600 rounded-xl px-6 py-2",
          },
        }).then(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/admin");
        });
      } else if (error?.status === 404) {
        toast.error(
          "API endpoint not found. Please check the server configuration."
        );
      } else {
        toast.error(
          error?.data?.message || error?.message || "Failed to add book!",
          {
            style: {
              borderRadius: "12px",
              background: "#EF4444",
              color: "#fff",
            },
          }
        );
      }
    }
  };

  const steps = [
    {
      number: 1,
      title: "Basic Info",
      description: "Title, Author & Description",
      icon: FaBook,
    },
    {
      number: 2,
      title: "Details",
      description: "Category, Image & Tags",
      icon: FaImage,
    },
    {
      number: 3,
      title: "Pricing",
      description: "Price & Quantity",
      icon: FaDollarSign,
    },
    {
      number: 4,
      title: "Review",
      description: "Final Review",
      icon: FaCheck,
    },
  ];

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: "2px solid #E5E7EB",
      borderRadius: "12px",
      padding: "8px",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
      borderColor: state.isFocused ? "#3B82F6" : "#E5E7EB",
      "&:hover": {
        borderColor: "#3B82F6",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3B82F6"
        : state.isFocused
        ? "#EBF4FF"
        : "white",
      color: state.isSelected ? "white" : "#374151",
      padding: "12px",
      cursor: "pointer",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9CA3AF",
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
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

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <FaPlus className="text-white text-2xl" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Add New Book
              </h1>
              <p className="text-gray-600 mt-1">
                Create a new book entry for your store
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 mb-8 border border-white/20"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.number}
                ref={(el) => (stepsRef.current[index] = el)}
                className="flex items-center flex-1"
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                      currentStep >= step.number
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                        : "bg-gray-300"
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {currentStep > step.number ? <FaCheck /> : <step.icon />}
                  </motion.div>
                  <div className="text-center mt-2">
                    <p className="text-sm font-semibold text-gray-800">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-600">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                      currentStep > step.number
                        ? "bg-gradient-to-r from-blue-500 to-purple-600"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          ref={formRef}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Basic Information
                    </h2>
                    <p className="text-gray-600">
                      Enter the basic details of your book
                    </p>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaBook className="inline mr-2" />
                      Book Title *
                    </label>
                    <input
                      {...register("title", { required: "Title is required" })}
                      type="text"
                      placeholder="Enter book title"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Author */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaUser className="inline mr-2" />
                      Author *
                    </label>
                    <AsyncSelect
                      cacheOptions
                      loadOptions={debouncedLoadOptions}
                      defaultOptions
                      onChange={setSelectedAuthor}
                      value={selectedAuthor}
                      placeholder="Search or select author"
                      isClearable
                      styles={customSelectStyles}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      {...register("description", {
                        required: "Description is required",
                      })}
                      rows={4}
                      placeholder="Enter book description"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 resize-none"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Publisher */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Publisher
                    </label>
                    <input
                      {...register("publish")}
                      type="text"
                      placeholder="Enter publisher name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Book Details
                    </h2>
                    <p className="text-gray-600">
                      Add category, image, and additional details
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaTag className="inline mr-2" />
                      Category *
                    </label>
                    <select
                      {...register("category", {
                        required: "Category is required",
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    >
                      <option value="">Select a category</option>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))
                      ) : (
                        <option disabled>Loading categories...</option>
                      )}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Cover Image - Optional */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaImage className="inline mr-2" />
                      Cover Image (Optional)
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors duration-200">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Cover Preview"
                            className="max-w-32 h-40 object-cover rounded-lg mx-auto shadow-lg"
                          />
                          {isUploading && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                className="bg-blue-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview("");
                              setCoverImage("");
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <div>
                          <FaCloudUploadAlt className="text-4xl text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-gray-500">
                            PNG, JPG up to 5MB (Optional)
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        accept="image/*"
                        disabled={isUploading}
                      />
                    </div>
                  </div>

                  {/* Tags - Optional */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaTag className="inline mr-2" />
                      Tags (Optional)
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={handleTagsChange}
                      placeholder="Enter tags (comma-separated)"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Separate tags with commas (e.g., fiction, romance,
                      bestseller)
                    </p>
                  </div>

                  {/* Language - Optional */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaLanguage className="inline mr-2" />
                      Language (Optional)
                    </label>
                    <select
                      value={language}
                      onChange={handleLanguageChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    >
                      <option value="Tiếng Anh">English</option>
                      <option value="Tiếng Việt">Vietnamese</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Pricing */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Pricing & Inventory
                    </h2>
                    <p className="text-gray-600">
                      Set the price and quantity for your book
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Old Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <RiPriceTag3Line className="inline mr-2" />
                        Original Price
                      </label>
                      <input
                        {...register("oldPrice")}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                      />
                    </div>

                    {/* New Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaDollarSign className="inline mr-2" />
                        Sale Price *
                      </label>
                      <input
                        {...register("newPrice", {
                          required: "Sale price is required",
                          min: 0,
                        })}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                      />
                      {errors.newPrice && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.newPrice.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantity in Stock *
                    </label>
                    <input
                      {...register("quantity", {
                        required: "Quantity is required",
                        min: 1,
                      })}
                      type="number"
                      placeholder="Enter quantity"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    />
                    {errors.quantity && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.quantity.message}
                      </p>
                    )}
                  </div>

                  {/* Trending */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register("trending")}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-3 text-sm font-semibold text-gray-700">
                      <FaChartLine className="inline mr-2" />
                      Mark as Trending Book
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Review & Submit
                    </h2>
                    <p className="text-gray-600">
                      Please review all information before submitting
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">
                          Book Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Title:</span>{" "}
                            {watchedFields.title || "Not specified"}
                          </p>
                          <p>
                            <span className="font-medium">Author:</span>{" "}
                            {selectedAuthor?.label || "Not specified"}
                          </p>
                          <p>
                            <span className="font-medium">Category:</span>{" "}
                            {categories.find(
                              (c) => c.value === watchedFields.category
                            )?.label || "Not specified"}
                          </p>
                          <p>
                            <span className="font-medium">Language:</span>{" "}
                            {language}
                          </p>
                          <p>
                            <span className="font-medium">Publisher:</span>{" "}
                            {watchedFields.publish || "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">
                          Pricing & Inventory
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Original Price:</span>{" "}
                            ${watchedFields.oldPrice || "0.00"}
                          </p>
                          <p>
                            <span className="font-medium">Sale Price:</span> $
                            {watchedFields.newPrice || "0.00"}
                          </p>
                          <p>
                            <span className="font-medium">Quantity:</span>{" "}
                            {watchedFields.quantity || "0"}
                          </p>
                          <p>
                            <span className="font-medium">Trending:</span>{" "}
                            {watchedFields.trending ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {coverImage && (
                      <div className="text-center">
                        <h3 className="font-semibold text-gray-800 mb-3">
                          Cover Image
                        </h3>
                        <img
                          src={coverImage || "/placeholder.svg"}
                          alt="Cover Preview"
                          className="max-w-32 h-40 object-cover rounded-lg mx-auto shadow-lg"
                        />
                      </div>
                    )}

                    {tags && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {tags.split(",").map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <motion.button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  currentStep === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
                whileHover={currentStep > 1 ? { scale: 1.05 } : {}}
                whileTap={currentStep > 1 ? { scale: 0.95 } : {}}
              >
                Previous
              </motion.button>

              <div className="flex items-center gap-4">
                {currentStep < 4 ? (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Next
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors duration-200 disabled:opacity-50"
                    whileHover={{ scale: isLoading ? 1 : 1.05 }}
                    whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Adding Book...
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        Add Book
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedAddBook;
