import React, { useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { useAddToCartMutation } from "../../redux/features/cart/cartApi";
import { useGetBookByIdQuery } from "../../redux/features/books/booksApi";
import { IoMdStar } from "react-icons/io";
import { FaBuilding } from "react-icons/fa";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import BookRecommendations from "../../components/BookRecommendations";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const SingleBook = () => {
  const { id } = useParams();
  const { data: book, isLoading, error } = useGetBookByIdQuery(id, {
    skip: !id || id === 'undefined'
  });
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [quantity, setQuantity] = useState(1);
  const { t } = useTranslation();

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
        {error?.data?.message || t('books.error')}
      </div>
    );
  }

  if (!book || !book._id) {
    return (
      <div className="container mx-auto p-6 text-gray-600">
        {t('books.notFound')}
      </div>
    );
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
              <strong>{t('books.author')}:</strong> {book.author?.name || "Unknown"}
            </p>

            {/* Rating */}
            <div className="flex mb-4">
              {[...Array(5)].map((_, index) => (
                <IoMdStar key={index} className="text-yellow-300 text-2xl" />
              ))}
            </div>

            <p className="text-gray-700 mb-2">
              <strong>{t('books.published')}:</strong> {book.publish}
            </p>
            <p className="text-gray-700 mb-2 capitalize">
              <strong>{t('books.category')}:</strong> {book.category?.name || "Unknown"}
            </p>
            <p className="text-gray-700 mb-2 capitalize">
              <strong>{t('books.tag')}:</strong> #{book.tags?.join(", ") || "Unknown"}
            </p>
            <p className="text-gray-700 mb-2 capitalize">
              <strong>{t('books.language')}:</strong> {book.language || "Unknown"}
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
              <strong>{t('books.description')}:</strong>{" "}
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
            <span>{t('books.Add to Cart')}</span>
          </button>
        </div>
      </div>
      <div className="bg-white text-gray-700 mt-8 px-8 py-6 flex justify-end flex-col gap-2 text-sm rounded-lg shadow-md border border-gray-200">
        <p className="font-semibold text-yellow-600">
          {t('books.delivery.free')}
        </p>
        <div className="flex gap-2 items-center">
          <FaBuilding className="text-yellow-600 text-xl" />
          <span>{t('books.delivery.city')}</span>
        </div>
        <div className="flex gap-2 items-center">
          <IoShieldCheckmarkSharp className="text-yellow-600 text-xl" />
          <span>{t('books.delivery.province')}</span>
        </div>
      </div>
      {book._id && <BookRecommendations bookId={book._id} />}
    </div>
  );
};

export default SingleBook;