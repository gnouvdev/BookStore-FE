import React, { useState } from "react";
  import { FiShoppingCart } from "react-icons/fi";
  import { useParams, useLocation } from "react-router-dom";
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

  const SingleBook = () => {
    const { id } = useParams();
    const location = useLocation();
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hoverRating, setHoverRating] = useState(0);

    const {
      data: book,
      isLoading,
      error,
    } = useGetBookByIdQuery(id, {
      skip: !id || id === "undefined",
    });

    const { data: reviewsData, error: reviewsError } = useGetReviewsQuery(id);
    const [createReview] = useCreateReviewMutation();

    const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
    const [quantity, setQuantity] = useState(1);

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

      if (!location.state?.orderId) {
        Swal.fire({
          icon: "error",
          title: t("reviews.error"),
          text: t("reviews.order_required"),
        });
        return;
      }

      try {
        console.log("Submitting review with data:", {
          bookId: id,
          orderId: location.state.orderId,
          rating,
          comment,
        });

        const result = await createReview({
          bookId: id,
          orderId: location.state.orderId,
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
        console.log("Error status:", error.status);
        console.log("Error data:", error.data);
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
      if (!currentUser || !location.state?.orderId || !location.state?.orderStatus) {
        console.log("Cannot review: missing user, orderId, or orderStatus", {
          currentUser,
          orderId: location.state?.orderId,
          orderStatus: location.state?.orderStatus,
        });
        return false;
      }

      const orderStatus = location.state.orderStatus;
      console.log("Order status:", orderStatus);
      return orderStatus === "completed";
    }, [currentUser, location.state]);

    // Kiểm tra xem người dùng đã đánh giá sách này trong đơn hàng này chưa
    const hasReviewed = React.useMemo(() => {
      if (!currentUser || !location.state?.orderId || !reviewsData?.data) {
        console.log("Cannot check review status: missing data");
        return false;
      }

      const hasReview = reviewsData.data.some(
        (review) =>
          review.order === location.state.orderId &&
          review.user._id === currentUser._id
      );
      console.log("Has reviewed:", hasReview);
      return hasReview;
    }, [currentUser, location.state, reviewsData]);

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

    if (reviewsError) {
      console.error("Get reviews error:", reviewsError);
    }

    const isOutOfStock = !book.quantity || book.quantity === 0;

    return (
      <div className="w-full container mx-auto">
        <div className="w-full shadow-md flex flex-col md:flex-row gap-8 p-6 bg-white rounded-lg mb-5">
          {/* Left: Book Image */}
          <img
            src={book.coverImage}
            alt={book.title}
            className="object-cover w-[300px] h-[370px] rounded-lg shadow-lg"
          />

          {/* Right: Book Details */}
          <div className="w-full flex flex-col justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-2 uppercase">{book.title}</h1>
              <p className="text-gray-700 text-sm mb-2">
                <strong>{t("books.author")}:</strong>{" "}
                {book.author?.name || "Unknown"}
              </p>

              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, index) => (
                  <IoMdStar key={index} className="text-yellow-300 text-2xl" />
                ))}
              </div>

              <p className="text-gray-700 mb-2">
                <strong>{t("books.published")}:</strong> {book.publish}
              </p>
              <p className="text-gray-700 mb-2 capitalize">
                <strong>{t("books.category")}:</strong>{" "}
                {book.category?.name || "Unknown"}
              </p>
              <p className="text-gray-700 mb-2 capitalize">
                <strong>{t("books.tag")}:</strong> #
                {book.tags?.join(", ") || "Unknown"}
              </p>
              <p className="text-gray-700 mb-2 capitalize">
                <strong>{t("books.language")}:</strong>{" "}
                {book.language || "Unknown"}
              </p>
              <p className="font-medium mb-3 text-5xl text-red-500">
                {book.price?.newPrice?.toLocaleString("vi-VN")} đ
                {book.price?.oldPrice && (
                  <span className="line-through font-normal ml-2 text-xl">
                    {book.price.oldPrice.toLocaleString("vi-VN")} đ
                  </span>
                )}
              </p>

              {/* Description with max length */}
              <p className="text-gray-700 mb-6">
                <strong>{t("books.description")}:</strong>{" "}
                {book.description?.length > 200
                  ? book.description.slice(0, 200) + "..."
                  : book.description}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={handleDecrease}
                  className="px-3 py-1 bg-gray-300 text-lg rounded"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="text-xl font-semibold">{quantity}</span>
                <button
                  onClick={handleIncrease}
                  className="px-3 py-1 bg-gray-300 text-lg rounded"
                  disabled={isOutOfStock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => handleAddToCart(book)}
              disabled={isAddingToCart || isOutOfStock}
              className="bg-primary text-black px-6 py-3 text-base rounded-lg flex items-center gap-2 hover:bg-blue-900 transition w-[280px] justify-center whitespace-nowrap disabled:opacity-50"
            >
              <FiShoppingCart className="text-lg" />
              <span>{t("books.Add to Cart")}</span>
            </button>
          </div>
        </div>
        <div className="bg-white text-gray-700 mt-8 px-8 py-6 flex justify-end flex-col gap-2 text-sm rounded-lg shadow-md border border-gray-200">
          <p className="font-semibold text-yellow-600">
            {t("books.delivery.free")}
          </p>
          <div className="flex gap-2 items-center">
            <FaBuilding className="text-yellow-600 text-xl" />
            <span>{t("books.delivery.city")}</span>
          </div>
          <div className="flex gap-2 items-center">
            <IoShieldCheckmarkSharp className="text-yellow-600 text-xl" />
            <span>{t("books.delivery.province")}</span>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
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
        </div>

        {book._id && <BookRecommendations bookId={book._id} />}
      </div>
    );
  };

  export default SingleBook;