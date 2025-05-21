import React from "react";
import { FiShoppingCart } from "react-icons/fi";
import { FaHeart, FaRegHeart, FaStar, FaRegStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAddToCartMutation } from "../../redux/features/cart/cartApi";
import { addToWishlist, removeFromWishlist } from "../../redux/features/wishlist/wishlistSlice";
import { useTranslation } from "react-i18next";

const BookCard = ({ book }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const isInWishlist = wishlistItems.some((item) => item._id === book._id);
  const [addToCart, { isLoading }] = useAddToCartMutation();

  const handleAddToCart = async () => {
    try {
      await addToCart({
        bookId: book._id,
        quantity: 1,
      }).unwrap();
      console.log("Added to cart:", book._id);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(book._id));
    } else {
      dispatch(addToWishlist(book));
    }
  };

  // Tính số sao hiển thị
  const rating = book.rating || 0;
  const numReviews = book.numReviews || 0;
  const roundedRating = Math.round(rating); // Làm tròn rating (1-5)

  return (
    <div className="bg-gray-200 rounded-xl p-4 mx-8 shadow-md w-60 max-w-xs h-full flex flex-col justify-between relative">
      <div className="flex flex-col items-center gap-3 h-full">
        {/* Hình ảnh sách */}
        <div className="h-56 w-40 flex-shrink-0 border rounded-md overflow-hidden relative">
          <Link to={`/books/${book._id}`}>
            <img
              src={book?.coverImage || "https://via.placeholder.com/150"}
              alt={book?.title}
              className="w-full h-full object-cover p-2 cursor-pointer hover:scale-105 transition-all duration-200"
            />
          </Link>
          {/* Tag giảm giá */}
          {book.discountPercentage > 0 && (
            <div className="absolute top-0 right-0 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-bl-lg shadow-lg animate-pulse transform translate-y-[-10%]">
              -{Math.round(book.discountPercentage)}%
            </div>
          )}
          {/* Nút wishlist */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-10 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            {isInWishlist ? (
              <FaHeart className="text-red-500 text-xl" />
            ) : (
              <FaRegHeart className="text-gray-500 text-xl" />
            )}
          </button>
        </div>

        {/* Thông tin sách */}
        <div className="flex flex-col items-center text-center flex-1 w-full">
          <Link to={`/books/${book._id}`}>
            <h3 className="text-lg font-medium hover:text-blue-600 mb-2 truncate w-48">
              {book?.title}
            </h3>
          </Link>
          {/* Rating thay cho description */}
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star}>
                {star <= roundedRating ? (
                  <FaStar className="text-yellow-400 text-sm" />
                ) : (
                  <FaRegStar className="text-gray-400 text-sm" />
                )}
              </span>
            ))}
            {numReviews > 0 && (
              <span className="text-gray-500 text-sm ml-1">({numReviews})</span>
            )}
          </div>

          <p className="font-medium mb-3 text-xl text-red-600">
            {book?.price?.newPrice.toLocaleString("vi-VN")} đ
            <span className="line-through font-normal ml-2 text-xs text-black">
              {book?.price?.oldPrice.toLocaleString("vi-VN")}đ
            </span>
          </p>
        </div>
      </div>

      {/* Nút Thêm vào giỏ hàng */}
      <button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="bg-primary text-black px-4 py-2 text-sm rounded-lg flex items-center gap-1 hover:bg-blue-900 transition w-full disabled:opacity-50"
      >
        <FiShoppingCart />
        <span>{t("books.addToCart")}</span>
      </button>
    </div>
  );
};

export default BookCard;