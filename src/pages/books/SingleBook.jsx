import React, { useState, useEffect, useRef } from "react";
// import { FiShoppingCart } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { useAddToCartMutation } from "../../redux/features/cart/cartApi";
import { useGetBookByIdQuery } from "../../redux/features/books/booksApi";
import { IoMdStar } from "react-icons/io";
import { FaBuilding } from "react-icons/fa";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
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
import { FaExpand, FaShoppingCart, FaHeart, FaShare } from "react-icons/fa";
// import { motion } from "framer-motion";

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

const SingleBook = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const ratingRef = useRef(null);
  const starsRef = useRef([]);
  const imageRef = useRef(null);
  const detailsRef = useRef(null);
  const priceRef = useRef(null);
  const descriptionRef = useRef(null);
  const reviewsRef = useRef(null);
  const [showFullImage, setShowFullImage] = useState(false);

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
  const [quantity, setQuantity] = useState(1);

  // Add useEffect to track book views
  useEffect(() => {
    const trackBookView = async () => {
      if (book?._id && currentUser) {
        try {
          // Log chi tiết currentUser để debug
          console.log("Current user object:", currentUser);
          console.log("Current user keys:", Object.keys(currentUser));

          // Thử lấy user ID từ nhiều nguồn khác nhau
          const userId =
            currentUser.uid ||
            currentUser._id ||
            currentUser.id ||
            currentUser.userId;

          if (!userId) {
            console.error("No user ID found in currentUser:", currentUser);
            // Thử lấy từ localStorage
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              console.log("Stored user:", parsedUser);
              const storedUserId =
                parsedUser.uid ||
                parsedUser._id ||
                parsedUser.id ||
                parsedUser.userId;
              if (storedUserId) {
                console.log("Using stored user ID:", storedUserId);
                await api.post("/viewHistory/", {
                  userId: storedUserId,
                  bookId: book._id,
                });
                return;
              }
            }
            return;
          }

          console.log("Using user ID:", userId);
          const response = await api.post("/viewHistory/", {
            userId: userId,
            bookId: book._id,
          });
          console.log("Book view tracked successfully:", response.data);
        } catch (error) {
          console.error(
            "Error tracking book view:",
            error.response?.data || error.message
          );
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Request URL:", error.config?.url);
            console.error("Request headers:", error.config?.headers);
          }
        }
      }
    };

    trackBookView();
  }, [book?._id, currentUser]);

  // Complex animations
  useEffect(() => {
    if (book) {
      // Timeline cho toàn bộ animation
      const tl = gsap.timeline();

      // Animation cho ảnh sách
      tl.fromTo(
        imageRef.current,
        {
          scale: 0.8,
          opacity: 0,
          rotation: -5,
        },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 1,
          ease: "elastic.out(1, 0.5)",
        }
      );

      // Animation cho tiêu đề và thông tin cơ bản
      tl.fromTo(
        detailsRef.current.children,
        {
          y: 30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.5"
      );

      // Animation cho rating stars
      tl.fromTo(
        starsRef.current,
        {
          scale: 0,
          opacity: 0,
          rotation: -180,
        },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
        },
        "-=0.3"
      );

      // Animation cho giá
      tl.fromTo(
        priceRef.current,
        {
          scale: 1.2,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.2"
      );

      // Animation cho mô tả
      tl.fromTo(
        descriptionRef.current,
        {
          height: 0,
          opacity: 0,
        },
        {
          height: "auto",
          opacity: 1,
          duration: 0.8,
          ease: "power2.inOut",
        }
      );

      // Scroll-triggered animations
      gsap.fromTo(
        reviewsRef.current,
        {
          y: 50,
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
      console.log("Submitting review with data:", {
        bookId: id,
        rating,
        comment,
      });

      const result = await createReview({
        bookId: id,
        rating,
        comment,
      }).unwrap();

      console.log("Review submission result:", result);

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
      let errorMessage = t("reviews.error_message");

      if (error.data?.message) {
        errorMessage = error.data.message;
      }

      Swal.fire({
        icon: "error",
        title: t("reviews.error"),
        text: errorMessage,
      });
    }
  };

  // Kiểm tra xem người dùng có thể đánh giá không
  const canReview = React.useMemo(() => {
    if (!currentUser) {
      console.log("Cannot review: missing user");
      return false;
    }
    return true;
  }, [currentUser]);

  // Kiểm tra xem người dùng đã đánh giá sách này chưa
  const hasReviewed = React.useMemo(() => {
    if (!currentUser || !reviewsData?.data) {
      console.log("Cannot check review status: missing data");
      return false;
    }

    const hasReview = reviewsData.data.some(
      (review) => review.user._id === currentUser._id
    );
    console.log("Has reviewed:", hasReview);
    return hasReview;
  }, [currentUser, reviewsData]);

  const handleAddToCart = async (product) => {
    if (product && product._id) {
      try {
        await addToCart({ bookId: product._id, quantity }).unwrap();
        console.log("Added to cart:", product._id);
        Swal.fire({
          icon: "success",
          title: t("cart.add_success"),
          showConfirmButton: false,
          timer: 1000,
        });
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

  const handleImageClick = () => {
    setShowFullImage(true);
  };

  const handleCloseFullImage = () => {
    setShowFullImage(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    console.error("Error details:", error);
    return (
      <div className="container mx-auto p-6 text-red-600">
        {error?.data?.message || t("books.error")}
      </div>
    );
  }

  if (!book || !book._id) {
    return (
      <div className="container mx-auto p-6 text-gray-600">
        {t("books.notFound")}
      </div>
    );
  }

  const isOutOfStock = !book.quantity || book.quantity === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full container mx-auto"
    >
      <div className="w-full shadow-md flex flex-col md:flex-row gap-8 p-6 bg-white rounded-lg mb-5 hover:shadow-xl transition-shadow duration-300">
        {/* Left: Book Image with enhanced features */}
        <div className="relative group">
          <LazyLoadImage
            ref={imageRef}
            src={book.coverImage}
            alt={book.title}
            effect="blur"
            className="object-cover w-[300px] h-[370px] rounded-lg shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
            wrapperClassName="w-[300px] h-[370px]"
            placeholderSrc={book.coverImage + "?w=50"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="bg-white p-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300">
              <FaHeart className="w-5 h-5" />
            </button>
            <button className="bg-white p-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300">
              <FaShare className="w-5 h-5" />
            </button>
            <button
              onClick={handleImageClick}
              className="bg-white p-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300"
            >
              <FaExpand className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Full Image Modal */}
        {showFullImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
            onClick={handleCloseFullImage}
          >
            <div className="relative max-w-4xl max-h-[90vh] p-4">
              <LazyLoadImage
                src={book.coverImage}
                alt={book.title}
                effect="blur"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                wrapperClassName="w-full h-full"
              />
              <button
                onClick={handleCloseFullImage}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-all duration-300"
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
              </button>
            </div>
          </div>
        )}

        {/* Right: Book Details */}
        <div ref={detailsRef} className="w-full flex flex-col justify-between">
          <div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-5xl font-bold mb-2 uppercase bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
            >
              {book.title}
            </motion.h1>
            <p className="text-gray-700 text-sm mb-2">
              <strong>{t("books.author")}:</strong>{" "}
              {book.author?.name || "Unknown"}
            </p>

            {/* Rating with Animation */}
            <div ref={ratingRef} className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    ref={(el) => (starsRef.current[index] = el)}
                    className="relative"
                  >
                    <IoMdStar
                      className={`text-2xl ${
                        index < Math.floor(book.rating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                    {index < (book.rating || 0) &&
                      index + 1 > (book.rating || 0) && (
                        <div
                          className="absolute top-0 left-0 overflow-hidden"
                          style={{
                            width: `${((book.rating || 0) % 1) * 100}%`,
                          }}
                        >
                          <IoMdStar className="text-2xl text-yellow-400" />
                        </div>
                      )}
                  </div>
                ))}
              </div>
              <span className="text-gray-600 font-medium">
                {book.rating ? book.rating.toFixed(1) : "0.0"}
              </span>
              <span className="text-gray-500 text-sm">
                ({book.reviewCount || 0} {t("reviews.review")})
              </span>
            </div>

            <p className="text-gray-700 mb-2">
              <strong>{t("books.published")}:</strong> {book.publish}
            </p>
            <p className="text-gray-700 mb-2 capitalize">
              <strong>{t("books.category")}:</strong>{" "}
              {t(`categories.${book.category?.name}`) || "Unknown"}
            </p>
            <p className="text-gray-700 mb-2 capitalize">
              <strong>{t("books.tag")}:</strong> #
              {book.tags?.join(", ") || "Unknown"}
            </p>
            <p className="text-gray-700 mb-2 capitalize">
              <strong>{t("books.language")}:</strong>{" "}
              {book.language || "Unknown"}
            </p>
            <p
              ref={priceRef}
              className="font-medium mb-3 text-5xl text-red-500"
            >
              {book.price?.newPrice?.toLocaleString("vi-VN")} đ
              {book.price?.oldPrice && (
                <span className="line-through font-normal ml-2 text-xl">
                  {book.price.oldPrice.toLocaleString("vi-VN")} đ
                </span>
              )}
            </p>

            {/* Description with max length */}
            <p ref={descriptionRef} className="text-gray-700 mb-6">
              <strong>{t("books.description")}:</strong>{" "}
              {book.description?.length > 200
                ? book.description.slice(0, 200) + "..."
                : book.description}
            </p>

            {/* Quantity Selector */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-4 mb-6"
            >
              <button
                onClick={handleDecrease}
                className="px-3 py-1 bg-gray-100 text-lg rounded-full hover:bg-gray-200 transition-colors duration-300"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="text-xl font-semibold">{quantity}</span>
              <button
                onClick={handleIncrease}
                className="px-3 py-1 bg-gray-100 text-lg rounded-full hover:bg-gray-200 transition-colors duration-300"
                disabled={isOutOfStock}
              >
                +
              </button>
            </motion.div>
          </div>

          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddToCart(book)}
            disabled={isAddingToCart || isOutOfStock}
            className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-8 py-3 text-base rounded-full flex items-center gap-2 hover:from-blue-500 hover:to-blue-300 transition-all duration-300 w-[280px] justify-center whitespace-nowrap disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            <FaShoppingCart className="text-lg" />
            <span>{t("books.Add to Cart")}</span>
          </motion.button>
        </div>
      </div>

      {/* Delivery Info with enhanced design */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-r from-blue-50 to-blue-100 text-gray-700 mt-8 px-8 py-6 flex justify-end flex-col gap-2 text-sm rounded-lg shadow-md border border-blue-200"
      >
        <p className="font-semibold text-blue-600">
          {t("books.delivery.free")}
        </p>
        <div className="flex gap-2 items-center">
          <FaBuilding className="text-blue-600 text-xl" />
          <span>{t("books.delivery.city")}</span>
        </div>
        <div className="flex gap-2 items-center">
          <IoShieldCheckmarkSharp className="text-blue-600 text-xl" />
          <span>{t("books.delivery.province")}</span>
        </div>
      </motion.div>

      {/* Reviews Section with enhanced design */}
      <motion.div
        ref={reviewsRef}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300"
      >
        <h2 className="text-2xl font-bold mb-6">{t("reviews.title")}</h2>

        {/* Review Form */}
        {canReview && !hasReviewed && (
          <form onSubmit={handleReviewSubmit} className="mb-8">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t("reviews.rating")}
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-2xl focus:outline-none"
                  >
                    <IoMdStar
                      className={`${
                        star <= (hoverRating || rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t("reviews.comment")}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("reviews.submit")}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviewsData?.data?.length > 0 ? (
            reviewsData.data.map((review) => (
              <div key={review._id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-center gap-4 mb-2">
                  <img
                    src={
                      review.user.photoURL || "https://via.placeholder.com/40"
                    }
                    alt={review.user.displayName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{review.user.displayName}</h3>
                    <p className="text-sm text-gray-500">{review.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, index) => (
                    <IoMdStar
                      key={index}
                      className={`${
                        index < review.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">{t("reviews.no_reviews")}</p>
            </div>
          )}
        </div>
      </motion.div>

      {book._id && <BookRecommendations bookId={book._id} />}
    </motion.div>
  );
};

export default SingleBook;
