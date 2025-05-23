import React, { useRef, useEffect } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { FaHeart, FaRegHeart, FaStar, FaRegStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAddToCartMutation } from "../../redux/features/cart/cartApi";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/features/wishlist/wishlistSlice";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import gsap from "gsap";

const BookCard = ({ book }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const isInWishlist = wishlistItems.some((item) => item._id === book._id);
  const [addToCart, { isLoading }] = useAddToCartMutation();

  // Refs cho các phần tử
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const buttonRef = useRef(null);
  const wishlistButtonRef = useRef(null);
  const titleRef = useRef(null);
  const priceRef = useRef(null);
  const ratingRef = useRef(null);

  useEffect(() => {
    // Animation khi hover vào card
    const card = cardRef.current;
    const image = imageRef.current;
    const button = buttonRef.current;
    const wishlistButton = wishlistButtonRef.current;
    const title = titleRef.current;
    const price = priceRef.current;
    const rating = ratingRef.current;

    const handleMouseEnter = () => {
      // Animation cho ảnh
      gsap.to(image, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out",
      });

      // Animation cho nút thêm vào giỏ hàng
      gsap.to(button, {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });

      // Animation cho nút wishlist
      gsap.to(wishlistButton, {
        opacity: 1,
        scale: 1.1,
        duration: 0.3,
        ease: "back.out(1.7)",
      });

      // Animation cho tiêu đề
      gsap.to(title, {
        y: -5,
        color: "#2563eb", // blue-600
        duration: 0.3,
        ease: "power2.out",
      });

      // Animation cho giá
      gsap.to(price, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out",
      });

      // Animation cho rating
      gsap.to(rating, {
        scale: 1.1,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      // Reset animation cho ảnh
      gsap.to(image, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });

      // Reset animation cho nút thêm vào giỏ hàng
      gsap.to(button, {
        y: "100%",
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      });

      // Reset animation cho nút wishlist
      gsap.to(wishlistButton, {
        opacity: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });

      // Reset animation cho tiêu đề
      gsap.to(title, {
        y: 0,
        color: "#1f2937", // gray-800
        duration: 0.3,
        ease: "power2.out",
      });

      // Reset animation cho giá
      gsap.to(price, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });

      // Reset animation cho rating
      gsap.to(rating, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Ngăn chặn chuyển hướng khi click vào nút
    try {
      await addToCart({
        bookId: book._id,
        quantity: 1,
      }).unwrap();
      toast.success(t("cart.added_to_cart"));
    } catch (error) {
      toast.error(error.data?.message || t("cart.add_failed"));
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault(); // Ngăn chặn chuyển hướng khi click vào nút wishlist
    if (isInWishlist) {
      dispatch(removeFromWishlist(book._id));
    } else {
      dispatch(addToWishlist(book));
    }
  };

  // Tính số sao hiển thị
  const rating = Number(book.rating) || 0;
  const numReviews = Number(book.numReviews) || 0;
  const roundedRating = Math.round(rating * 2) / 2;

  // Hàm render sao
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(roundedRating)) {
        stars.push(<FaStar key={i} className="text-yellow-400 text-sm" />);
      } else if (i - 0.5 === roundedRating) {
        stars.push(
          <div key={i} className="relative">
            <FaRegStar className="text-gray-400 text-sm" />
            <FaStar className="text-yellow-400 text-sm absolute left-0 w-1/2 overflow-hidden" />
          </div>
        );
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-400 text-sm" />);
      }
    }
    return stars;
  };

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl h-[450px] flex flex-col w-[280px]"
    >
      <Link to={`/books/${book._id}`} className="block relative">
        <div className="relative overflow-hidden h-[250px]">
          <img
            ref={imageRef}
            src={book?.coverImage || "https://via.placeholder.com/150"}
            alt={book?.title}
            className="w-full h-full object-contain transition-transform duration-300"
          />
          {/* Tag giảm giá */}
          {book.discountPercentage > 0 && (
            <div className="absolute top-0 right-0 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-bl-lg shadow-lg">
              -{Math.round(book.discountPercentage)}%
            </div>
          )}
          {/* Nút wishlist */}
          <button
            ref={wishlistButtonRef}
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors opacity-0"
          >
            {isInWishlist ? (
              <FaHeart className="text-red-500 text-xl" />
            ) : (
              <FaRegHeart className="text-gray-500 text-xl" />
            )}
          </button>
          {/* Nút thêm vào giỏ hàng */}
          <button
            ref={buttonRef}
            onClick={handleAddToCart}
            disabled={isLoading}
            className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white py-2 rounded-b-lg hover:bg-blue-700 transition-colors transform translate-y-full opacity-0"
          >
            {isLoading ? t("loading") : t("books.addToCart")}
          </button>
        </div>
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <Link to={`/books/${book._id}`}>
          <h3
            ref={titleRef}
            className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors line-clamp-2"
          >
            {book?.title}
          </h3>
        </Link>
        {/* Rating */}
        <div ref={ratingRef} className="flex items-center gap-1 mb-2">
          {renderStars()}
          {numReviews > 0 && (
            <span className="text-gray-500 text-sm ml-1">
              ({rating.toFixed(1)})
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
          {book?.description}
        </p>
        <div className="mt-auto">
          <div className="flex justify-between items-center">
            <div ref={priceRef} className="flex items-center space-x-2">
              <span className="text-lg font-bold text-blue-600 whitespace-nowrap">
                {book?.price?.newPrice.toLocaleString("vi-VN")} đ
              </span>
              {book?.price?.oldPrice && (
                <span className="text-sm text-gray-500 line-through whitespace-nowrap">
                  {book?.price?.oldPrice.toLocaleString("vi-VN")}đ
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
