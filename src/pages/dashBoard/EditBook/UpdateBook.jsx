/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaBook,
  FaUser,
  FaImage,
  FaTag,
  FaDollarSign,
  FaLanguage,
  FaChartLine,
  FaTimes,
  FaSpinner,
  FaEdit,
  FaCloudUploadAlt,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa";
import { RiPriceTag3Line } from "react-icons/ri";
import {
  useGetBookByIdQuery,
  useUpdateBookMutation,
} from "../../../redux/features/books/booksApi";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";
import { uploadToCloudinary } from "../../../utils/uploadService";
import debounce from "lodash/debounce";
import AsyncSelect from "react-select/async";
import axios from "axios";
import baseUrl from "../../../utils/baseURL";
import gsap from "gsap";

// Create axios instance with default config
const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

const EnhancedUpdateBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const formRef = useRef(null);
  const headerRef = useRef(null);

  const {
    data: bookData,
    isLoading,
    isError,
    error,
  } = useGetBookByIdQuery(id, {
    skip: !isAuthenticated,
  });

  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
  const [coverImage, setCoverImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("Tiếng Anh");
  const [imagePreview, setImagePreview] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  // Watch form values to detect changes
  const watchedFields = watch();

  // Enhanced animations
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }

    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to continue");
      navigate("/admin");
      return;
    }
    setIsAuthenticated(true);

    // Set default authorization header
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, [navigate]);

  useEffect(() => {
    console.log("Book ID từ useParams:", id);
    console.log("Book data từ useGetBookByIdQuery:", bookData);
    if (!id) {
      console.error("Book ID is missing in the URL");
      toast.error("Invalid book ID. Please try again.");
      navigate("/dashboard/manage-books");
    }
    if (isError) {
      console.error("Error fetching book:", error);
      const errorMessage = error?.data?.message || "Failed to load book data.";
      toast.error(errorMessage);
      navigate("/dashboard/manage-books");
    }
  }, [id, bookData, isError, error, navigate]);

  useEffect(() => {
    if (bookData) {
      setValue("title", bookData.title);
      setValue("author", bookData.author?._id || bookData.author);
      setValue("description", bookData.description);
      setValue("category", bookData.category?._id || bookData.category);
      setValue("publish", bookData.publish?._id || bookData.publish);
      setValue("trending", bookData.trending);
      setValue("oldPrice", bookData.price?.oldPrice);
      setValue("newPrice", bookData.price?.newPrice);
      setValue("quantity", bookData.quantity);
      setValue("coverImage", bookData.coverImage);
      setTags(bookData.tags?.join(", ") || "");
      setLanguage(bookData.language || "Tiếng Anh");
      setCoverImage(bookData.coverImage || "");
      setImagePreview(bookData.coverImage || "");
    }
  }, [bookData, setValue]);

  // Fetch categories with authentication
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        if (response.data && Array.isArray(response.data)) {
          setCategories(
            response.data.map((category) => ({
              value: category._id,
              label: category.name,
            }))
          );
        } else {
          console.error("Invalid categories data format:", response.data);
          toast.error("Failed to load categories: Invalid data format");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        if (error.response?.status === 401) {
          handleAuthError();
        } else {
          toast.error(
            error.response?.data?.message || "Failed to load categories"
          );
        }
      }
    };

    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated]);

  const loadAuthorOptions = debounce(async (inputValue) => {
    if (!inputValue || !isAuthenticated) return [];

    try {
      const response = await api.get(`/authors/search?name=${inputValue}`);
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((author) => ({
          value: author._id,
          label: author.name,
        }));
      } else {
        console.error("Invalid authors data format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching authors:", error);
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        toast.error(error.response?.data?.message || "Failed to load authors");
      }
      return [];
    }
  }, 300);

  const handleAuthError = () => {
    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin");
  };

  const handleTagsChange = (event) => {
    setTags(event.target.value);
    setHasChanges(true);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
    setHasChanges(true);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn một tệp ảnh hợp lệ");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh phải nhỏ hơn 5MB");
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
        setValue("coverImage", url);
        setHasChanges(true);
        toast.success("Ảnh đã được tải lên thành công!", {
          icon: "🎉",
          style: {
            borderRadius: "12px",
            background: "#10B981",
            color: "#fff",
          },
        });
      } else {
        toast.error("Không thể tải lên ảnh.");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Đã xảy ra lỗi khi tải lên ảnh.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      navigate("/admin");
      return;
    }

    if (!bookData || !bookData._id) {
      toast.error("Dữ liệu cuốn sách bị thiếu. Không thể cập nhật.");
      return;
    }

    const updatedBookData = {
      title: data.title,
      author: data.author,
      description: data.description,
      category: data.category,
      publish: data.publish,
      trending: data.trending,
      quantity: Number.parseInt(data.quantity),
      coverImage: coverImage || bookData.coverImage,
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

    try {
      const response = await updateBook({
        id: bookData._id,
        ...updatedBookData,
      }).unwrap();

      console.log("Update response:", response);

      // Success animation
      Swal.fire({
        title: "🎉 Cuốn sách đã được cập nhật thành công!",
        text: "Chi tiết cuốn sách của bạn đã được cập nhật thành công!",
        icon: "success",
        confirmButtonText: "Tiếp tục chỉnh sửa",
        showCancelButton: true,
        cancelButtonText: "Trở lại cuốn sách",
        background: "#fff",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "bg-blue-500 hover:bg-blue-600 rounded-xl px-6 py-2",
          cancelButton: "bg-gray-500 hover:bg-gray-600 rounded-xl px-6 py-2",
        },
      }).then((result) => {
        if (!result.isConfirmed) {
          navigate("/dashboard/manage-books");
        } else {
          setHasChanges(false);
        }
      });
    } catch (error) {
      console.error("Update failed:", error);
      if (error.status === 401) {
        handleAuthError();
      } else {
        const errorMessage =
          error.data?.message ||
          "Không thể cập nhật cuốn sách. Vui lòng thử lại.";
        toast.error(errorMessage, {
          style: {
            borderRadius: "12px",
            background: "#EF4444",
            color: "#fff",
          },
        });
      }
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-xl font-semibold text-gray-700">
            Đang tải dữ liệu cuốn sách...
          </p>
        </motion.div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4"
        >
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Lỗi tải dữ liệu cuốn sách
          </h2>
          <p className="text-gray-600">Không thể tải dữ liệu cuốn sách</p>
        </motion.div>
      </div>
    );
  }

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
          ref={headerRef}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.button
              onClick={() => navigate("/dashboard/manage-books")}
              className="absolute left-0 flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaArrowLeft />
              Back
            </motion.button>

            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <FaEdit className="text-white text-2xl" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Cập nhật sách
              </h1>
              <p className="text-gray-600 mt-1">
                Chỉnh sửa chi tiết và thông tin sách
              </p>
            </div>
          </div>

          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-100 border border-yellow-300 rounded-xl p-3 max-w-md mx-auto"
            >
              <p className="text-yellow-800 text-sm">
                <FaEdit className="inline mr-2" />
                Bạn có thay đổi chưa lưu
              </p>
            </motion.div>
          )}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Thông tin cơ bản
                  </h2>

                  {/* Title */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaBook className="inline mr-2" />
                      Tên sách *
                    </label>
                    <input
                      {...register("title", {
                        required: "Tên sách là bắt buộc",
                      })}
                      type="text"
                      placeholder="Nhập tên sách"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                      onChange={() => setHasChanges(true)}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Author */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaUser className="inline mr-2" />
                      Author *
                    </label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      loadOptions={loadAuthorOptions}
                      onChange={(selectedOption) => {
                        setValue(
                          "author",
                          selectedOption ? selectedOption.value : ""
                        );
                        setHasChanges(true);
                      }}
                      defaultValue={
                        bookData?.author
                          ? {
                              value: bookData.author._id,
                              label: bookData.author.name,
                            }
                          : null
                      }
                      placeholder="Tìm kiếm hoặc chọn tác giả"
                      styles={customSelectStyles}
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mô tả *
                    </label>
                    <textarea
                      {...register("description", {
                        required: "Description is required",
                      })}
                      rows={4}
                      placeholder="Nhập mô tả sách"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 resize-none"
                      onChange={() => setHasChanges(true)}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Publisher */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nhà xuất bản
                    </label>
                    <input
                      {...register("publish")}
                      type="text"
                      placeholder="Nhập tên nhà xuất bản"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                      onChange={() => setHasChanges(true)}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Chi tiết và giá
                  </h2>

                  {/* Category */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaTag className="inline mr-2" />
                      Thể loại *
                    </label>
                    <select
                      {...register("category", {
                        required: "Category is required",
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                      onChange={() => setHasChanges(true)}
                    >
                      <option value="">Chọn một thể loại</option>
                      {categories && categories.length > 0 ? (
                        categories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))
                      ) : (
                        <option disabled>Đang tải thể loại...</option>
                      )}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Cover Image */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaImage className="inline mr-2" />
                      Hình ảnh bìa
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors duration-200">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Ảnh bìa"
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
                              setHasChanges(true);
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Xóa ảnh
                          </button>
                        </div>
                      ) : (
                        <div>
                          <FaCloudUploadAlt className="text-4xl text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">
                            Nhấp để tải lên hoặc kéo và thả
                          </p>
                          <p className="text-sm text-gray-500">
                            PNG, JPG lên đến 5MB
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={isUploading}
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaTag className="inline mr-2" />
                      Tags
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={handleTagsChange}
                      placeholder="Nhập tags (phân cách bằng dấu phẩy)"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Tách tags bằng dấu phẩy (ví dụ: fiction, romance,
                      bestseller)
                    </p>
                  </div>

                  {/* Language */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaLanguage className="inline mr-2" />
                      Ngôn ngữ
                    </label>
                    <select
                      value={language}
                      onChange={handleLanguageChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    >
                      <option value="Tiếng Anh">Tiếng Anh</option>
                      <option value="Tiếng Việt">Tiếng Việt</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Giá và tồn kho
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Old Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <RiPriceTag3Line className="inline mr-2" />
                    Giá gốc
                  </label>
                  <input
                    {...register("oldPrice")}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    onChange={() => setHasChanges(true)}
                  />
                </div>

                {/* New Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaDollarSign className="inline mr-2" />
                    Giá bán
                  </label>
                  <input
                    {...register("newPrice", {
                      required: "Giá bán là bắt buộc",
                      min: 0,
                    })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    onChange={() => setHasChanges(true)}
                  />
                  {errors.newPrice && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.newPrice.message}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số lượng trong kho
                  </label>
                  <input
                    {...register("quantity", {
                      required: "Quantity is required",
                      min: 0,
                    })}
                    type="number"
                    placeholder="Nhập số lượng"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    onChange={() => setHasChanges(true)}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Trending */}
              <div className="mt-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trending"
                    {...register("trending")}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                    onChange={() => setHasChanges(true)}
                  />
                  <label
                    htmlFor="trending"
                    className="ml-3 text-sm font-semibold text-gray-700"
                  >
                    <FaChartLine className="inline mr-2" />
                    Đánh dấu là sách trending
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <motion.button
                type="button"
                onClick={() => navigate("/dashboard/manage-books")}
                className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTimes />
                Hủy bỏ
              </motion.button>

              <motion.button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 bg-blue-500 text-white px-8 py-3 rounded-xl hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
                whileHover={{ scale: isUpdating ? 1 : 1.05 }}
                whileTap={{ scale: isUpdating ? 1 : 0.95 }}
              >
                {isUpdating ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Cập nhật sách
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedUpdateBook;
