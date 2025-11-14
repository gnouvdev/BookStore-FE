import React from "react";
import { Link } from "react-router-dom";
import { FaStar, FaRegStar } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useAddToCartMutation } from "../redux/features/cart/cartApi";
import {
  addToWishlist,
  removeFromWishlist,
} from "../redux/features/wishlist/wishlistSlice";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { FiShoppingCart } from "react-icons/fi";
import { FaHeart, FaRegHeart } from "react-icons/fa";

// BookCard thu nhỏ cho ChatBox
const ChatBookCard = ({ book }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const isInWishlist = wishlistItems.some((item) => item._id === book._id);
  const [addToCart, { isLoading }] = useAddToCartMutation();
  const user = useSelector((state) => state.auth.user);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Bạn cần đăng nhập để thêm vào giỏ hàng!");
      return;
    }
    try {
      await addToCart({
        bookId: book._id,
        quantity: 1,
      }).unwrap();
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (error) {
      toast.error(error.data?.message || t("cart.add_failed"));
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      dispatch(removeFromWishlist(book._id));
      toast.success("Đã xóa khỏi wishlist");
    } else {
      dispatch(addToWishlist(book));
      toast.success("Đã thêm vào wishlist");
    }
  };

  const rating =
    typeof book.rating === "number"
      ? book.rating
      : parseFloat(book.rating) || 0;
  const roundedRating = Math.round(rating * 2) / 2;

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(roundedRating)) {
        stars.push(<FaStar key={i} className="text-yellow-400 text-xs" />);
      } else if (i - 0.5 === roundedRating) {
        stars.push(
          <div key={i} className="relative inline-block w-[10px] h-[10px]">
            <FaRegStar className="text-gray-400 text-xs absolute inset-0" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <FaStar className="text-yellow-400 text-xs" />
            </div>
          </div>
        );
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-400 text-xs" />);
      }
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-row h-[110px] w-full">
      {/* Image */}
      <Link
        to={`/books/${book._id}`}
        className="block relative flex-shrink-0 w-[70px] h-full bg-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={book?.coverImage || "https://via.placeholder.com/150"}
          alt={book?.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/150";
          }}
        />
        {book.trending && (
          <div className="absolute top-0.5 left-0.5 bg-red-500 text-white text-[7px] font-bold px-1 py-0.5 rounded">
            🔥
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 p-2 flex flex-col justify-between min-w-0">
        <div className="flex-1 min-w-0">
          <Link
            to={`/books/${book._id}`}
            className="block"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-0.5 hover:text-blue-600 transition-colors leading-tight">
              {book?.title}
            </h4>
          </Link>

          <p className="text-[10px] text-gray-500 mb-0.5 line-clamp-1">
            {book?.author?.name || "Chưa có"}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-0.5 mb-0.5">
            <div className="flex items-center">{renderStars()}</div>
            <span className="text-[10px] text-gray-500 ml-0.5">
              {rating.toFixed(1)} ({book.numReviews || 0})
            </span>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <span className="text-xs font-bold text-blue-600 whitespace-nowrap">
              {book?.price?.newPrice?.toLocaleString("vi-VN")} đ
            </span>
            {book?.price?.oldPrice && (
              <span className="text-[10px] text-gray-400 line-through whitespace-nowrap">
                {book?.price?.oldPrice.toLocaleString("vi-VN")} đ
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={handleWishlistToggle}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              title="Wishlist"
            >
              {isInWishlist ? (
                <FaHeart className="text-red-500 text-[10px]" />
              ) : (
                <FaRegHeart className="text-gray-500 text-[10px]" />
              )}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors flex-shrink-0 disabled:opacity-50"
              title="Thêm vào giỏ"
            >
              <FiShoppingCart className="text-[10px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBookCard;
