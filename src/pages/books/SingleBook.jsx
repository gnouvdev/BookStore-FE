/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { useAddToCartMutation } from "../../redux/features/cart/cartApi";
import { useGetBookByIdQuery } from "../../redux/features/books/booksApi";
import { IoMdStar } from "react-icons/io";
import {
  FaShoppingCart,
  FaHeart,
  FaShare,
  FaExpand,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import {
  RiTruckFill,
  RiSecurePaymentFill,
  RiRefund2Fill,
} from "react-icons/ri";
import BookRecommendations from "../../components/BookRecommendations";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import {
  useCreateReviewMutation,
  useGetReviewsQuery,
} from "../../redux/features/reviews/reviewsApi";
import axios from "axios";
import baseUrl from "../../utils/baseURL";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import "../../styles/SingleBook.css";
gsap.registerPlugin(ScrollTrigger);

// Cấu hình axios
const api = axios.create({
  baseURL: baseUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const EnhancedSingleBook = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const imageRef = useRef(null);
  const detailsRef = useRef(null);
  const reviewsRef = useRef(null);

  const {
    data: book,
    isLoading,
    error,
  } = useGetBookByIdQuery(id, {
    skip: !id || id === "undefined",
  });

  const { data: reviewsData } = useGetReviewsQuery(id);
  const [createReview] = useCreateReviewMutation();
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  // Track book views
  useEffect(() => {
    const trackBookView = async () => {
      if (book?._id && currentUser) {
        try {
          const userId =
            currentUser.uid ||
            currentUser._id ||
            currentUser.id ||
            currentUser.userId;
          if (!userId) {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              const storedUserId =
                parsedUser.uid ||
                parsedUser._id ||
                parsedUser.id ||
                parsedUser.userId;
              if (storedUserId) {
                await api.post("/viewHistory/", {
                  userId: storedUserId,
                  bookId: book._id,
                });
                return;
              }
            }
            return;
          }

          await api.post("/viewHistory/", {
            userId: userId,
            bookId: book._id,
          });
        } catch (error) {
          console.error(
            "Error tracking book view:",
            error.response?.data || error.message
          );
        }
      }
    };

    trackBookView();
  }, [book?._id, currentUser]);

  // Enhanced animations
  useEffect(() => {
    if (book) {
      const tl = gsap.timeline();

      tl.fromTo(
        imageRef.current,
        {
          scale: 0.8,
          opacity: 0,
          rotationY: -45,
        },
        {
          scale: 1,
          opacity: 1,
          rotationY: 0,
          duration: 1.2,
          ease: "power3.out",
        }
      ).fromTo(
        detailsRef.current?.children || [],
        {
          x: 50,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.8"
      );

      gsap.fromTo(
        reviewsRef.current,
        {
          y: 100,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: reviewsRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          ease: "power2.out",
        }
      );
    }
  }, [book]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      Swal.fire({
        icon: "error",
        title: t("reviews.login_required"),
        text: t("reviews.please_login"),
      });
      return;
    }

    if (!rating) {
      Swal.fire({
        icon: "error",
        title: t("reviews.rating_required"),
        text: t("reviews.please_select_rating"),
      });
      return;
    }

    try {
      const result = await createReview({
        bookId: id,
        rating,
        comment,
      }).unwrap();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: t("reviews.success"),
          text: t("reviews.thank_you"),
        });
        setRating(0);
        setComment("");
      }
    } catch (error) {
      console.error("Review error:", error);
      Swal.fire({
        icon: "error",
        title: t("reviews.error"),
        text: error.data?.message || t("reviews.error_message"),
      });
    }
  };

  const handleAddToCart = async (product) => {
    if (product && product._id) {
      try {
        await addToCart({ bookId: product._id, quantity }).unwrap();
      } catch (error) {
        console.error("Error adding to cart:", error);
        Swal.fire({
          icon: "error",
          title: t("cart.error"),
          text: error?.data?.message || t("cart.add_failed"),
        });
      }
    }
  };

  const handleIncrease = () => {
    if (book && book.quantity && quantity < book.quantity) {
      setQuantity((prev) => prev + 1);
    } else if (book && quantity >= book.quantity) {
      Swal.fire({
        icon: "warning",
        title: t("cart.error"),
        text: t("cart.insufficient_stock"),
      });
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const canReview =
    currentUser &&
    reviewsData?.data &&
    !reviewsData.data.some((review) => review.user._id === currentUser._id);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto p-6 flex justify-center items-center min-h-[400px]"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  if (error || !book || !book._id) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto p-6 text-center"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {t("books.error")}
          </h2>
          <p className="text-red-500">
            {error?.data?.message || t("books.notFound")}
          </p>
        </div>
      </motion.div>
    );
  }

  const isOutOfStock = !book.quantity || book.quantity === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full container mx-auto px-4 py-8"
    >
      {/* Main Product Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8"
      >
        <div className="flex flex-col lg:flex-row">
          {/* Enhanced Image Section */}
          <div className="lg:w-1/3 p-8">
            <motion.div
              ref={imageRef}
              className="relative group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl ">
                <LazyLoadImage
                  src={book.coverImage}
                  alt={book.title}
                  effect="blur"
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                  wrapperClassName="w-full h-[500px]"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 " />

                {/* Action Buttons */}
                <motion.div
                  className="absolute bottom-6 left-6 right-6 flex justify-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-3 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 ${
                      isWishlisted
                        ? "bg-red-500 text-white"
                        : "bg-white/20 text-white hover:bg-white hover:text-gray-800"
                    }`}
                  >
                    <FaHeart className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-gray-800 transition-all duration-300 border border-white/20"
                  >
                    <FaShare className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowFullImage(true)}
                    className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-gray-800 transition-all duration-300 border border-white/20"
                  >
                    <FaExpand className="w-5 h-5" />
                  </motion.button>
                </motion.div>

                {/* Discount Badge */}
                {book.price?.oldPrice && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg"
                  >
                    -
                    {Math.round(
                      ((book.price.oldPrice - book.price.newPrice) /
                        book.price.oldPrice) *
                        100
                    )}
                    %
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Enhanced Details Section */}
          <div
            ref={detailsRef}
            className="lg:w-1/2 p-8 flex flex-col justify-between"
          >
            <div>
              <motion.h1
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight"
              >
                {book.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-xl text-gray-600 mb-6"
              >
                {t("books.author")}:{" "}
                <span className="font-semibold text-gray-800">
                  {book.author?.name || "Unknown"}
                </span>
              </motion.p>

              {/* Enhanced Rating */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center gap-4 mb-6"
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                    >
                      <IoMdStar
                        className={`text-2xl ${
                          index < Math.floor(book.rating || 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-700">
                  {book.rating ? book.rating.toFixed(1) : "0.0"}
                </span>
                <span className="text-gray-500">
                  ({reviewsData?.data?.length || 0} {t("reviews.review")})
                </span>
              </motion.div>

              {/* Enhanced Price */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mb-8"
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold text-red-500">
                    {book.price?.newPrice?.toLocaleString("vi-VN")} đ
                  </span>
                  {book.price?.oldPrice && (
                    <span className="text-xl text-gray-400 line-through">
                      {book.price.oldPrice.toLocaleString("vi-VN")} đ
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Book Info Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="grid grid-cols-2 gap-4 mb-8"
              >
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">
                    {t("books.published")}
                  </p>
                  <p className="font-semibold">{book.publish}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">
                    {t("books.category")}
                  </p>
                  <p className="font-semibold capitalize">
                    {book.category?.name || "Unknown"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">
                    {t("books.language")}
                  </p>
                  <p className="font-semibold">{book.language || "Unknown"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">{t("books.tag")}</p>
                  <p className="font-semibold">
                    #{book.tags?.join(", ") || "Unknown"}
                  </p>
                </div>
              </motion.div>

              {/* Enhanced Quantity Selector */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex items-center gap-6 mb-8"
              >
                <span className="text-lg font-semibold">
                  {t("books.quantity")}:
                </span>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDecrease}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50 transition-colors duration-200"
                  >
                    <FaMinus className="w-4 h-4" />
                  </motion.button>
                  <span className="text-2xl font-bold w-12 text-center">
                    {quantity}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleIncrease}
                    disabled={isOutOfStock}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50 transition-colors duration-200"
                  >
                    <FaPlus className="w-4 h-4" />
                  </motion.button>
                </div>
                {book.quantity && (
                  <span className="text-sm text-gray-500">
                    ({book.quantity} {t("books.available")})
                  </span>
                )}
              </motion.div>
            </div>

            {/* Enhanced Add to Cart Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAddToCart(book)}
              disabled={isAddingToCart || isOutOfStock}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 shadow-lg"
            >
              {isAddingToCart ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <FaShoppingCart className="w-5 h-5" />
                  <span>
                    {isOutOfStock
                      ? t("books.out_of_stock")
                      : t("books.Add to Cart")}
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Delivery Info */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {t("books.delivery.title")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <RiTruckFill className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {t("books.delivery.free")}
              </p>
              <p className="text-sm text-gray-600">
                {t("books.delivery.city")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <RiSecurePaymentFill className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {t("books.delivery.secure")}
              </p>
              <p className="text-sm text-gray-600">
                {t("books.delivery.payment")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <RiRefund2Fill className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {t("books.delivery.return")}
              </p>
              <p className="text-sm text-gray-600">
                {t("books.delivery.policy")}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Tabs Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
      >
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {[
            { id: "description", label: t("books.tabs.description") },
            { id: "reviews", label: t("books.tabs.reviews") },
            { id: "specifications", label: t("books.tabs.specifications") },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === "description" && (
              <motion.div
                key="description"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold mb-4">
                  {t("books.description")}
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {book.description}
                </p>
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div
                key="reviews"
                ref={reviewsRef}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold mb-6">
                  {t("reviews.title")}
                </h3>

                {/* Review Form */}
                {canReview && (
                  <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onSubmit={handleReviewSubmit}
                    className="bg-gray-50 rounded-xl p-6 mb-8"
                  >
                    <h4 className="text-lg font-semibold mb-4">
                      {t("reviews.write_review")}
                    </h4>

                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        {t("reviews.rating")}
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-3xl focus:outline-none transition-transform duration-200"
                          >
                            <IoMdStar
                              className={`${
                                star <= (hoverRating || rating)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-gray-700 font-semibold mb-2">
                        {t("reviews.comment")}
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        rows="4"
                        placeholder={t("reviews.comment_placeholder")}
                        required
                      />
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                    >
                      {t("reviews.submit")}
                    </motion.button>
                  </motion.form>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviewsData?.data?.length > 0 ? (
                    reviewsData.data.map((review, index) => (
                      <motion.div
                        key={review._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <img
                            src={
                              review.user.photoURL ||
                              "https://via.placeholder.com/50"
                            }
                            alt={review.user.displayName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {review.user.displayName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {review.user.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          {[...Array(5)].map((_, index) => (
                            <IoMdStar
                              key={index}
                              className={`text-lg ${
                                index < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📝</div>
                      <p className="text-gray-500 text-lg">
                        {t("reviews.no_reviews")}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "specifications" && (
              <motion.div
                key="specifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold mb-6">
                  {t("books.specifications")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      label: t("books.author"),
                      value: book.author?.name || "Unknown",
                    },
                    { label: t("books.published"), value: book.publish },
                    {
                      label: t("books.category"),
                      value: book.category?.name || "Unknown",
                    },
                    {
                      label: t("books.language"),
                      value: book.language || "Unknown",
                    },
                    { label: t("books.pages"), value: book.pages || "N/A" },
                    { label: t("books.isbn"), value: book.isbn || "N/A" },
                  ].map((spec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <p className="text-sm text-gray-500 mb-1">{spec.label}</p>
                      <p className="font-semibold text-gray-800">
                        {spec.value}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Full Image Modal */}
      <AnimatePresence>
        {showFullImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFullImage(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <LazyLoadImage
                src={book.coverImage}
                alt={book.title}
                effect="blur"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowFullImage(false)}
                className="absolute top-4 right-4 text-white bg-black/50 p-3 rounded-full hover:bg-black/70 transition-all duration-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book Recommendations */}
      {book._id && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <BookRecommendations bookId={book._id} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default EnhancedSingleBook;
