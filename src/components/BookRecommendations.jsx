/* eslint-disable no-unused-vars */
"use client";
import { motion } from "framer-motion";
import { useGetRecommendationsQuery } from "../redux/features/recommendations/recommendationsApi";
import { Link } from "react-router-dom";
import { FaStar, FaEye } from "react-icons/fa";
import BookCard from "./../pages/books/BookCart";
import { t } from "i18next";

const BookRecommendations = ({ bookId }) => {
  const { data, isLoading, isError, error } = useGetRecommendationsQuery(
    bookId,
    {
      skip: !bookId,
    }
  );

  const recommendations = data?.recommendations || [];
  console.log("Recommendations data:", data);
  console.log("Recommendations:", recommendations);
  console.log("First book:", recommendations[0]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <div className="flex items-center justify-center">
            <motion.div
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <span className="ml-4 text-lg font-medium text-gray-700">
              Loading recommendations...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="text-red-600 text-lg font-medium mb-2">
            Oops! Something went wrong
          </div>
          <div className="text-red-500">
            {error?.data?.message || "Failed to load recommendations"}
          </div>
        </div>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <FaEye className="text-4xl text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600 text-lg font-medium">
            {t(`common.No recommendations available`)}
          </div>
          <div className="text-gray-500 mt-2">
            {t(`common.Check back later for personalized book suggestions`)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl shadow-lg mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center gap-4 mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
          <FaStar className="text-white text-xl" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {t(`common.Recommended Books`)}
          </h2>
          <p className="text-gray-600 mt-1">
            {t(`common.Books you might love based on your interests`)}
          </p>
        </div>
      </motion.div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendations.map((book, index) => (
          <motion.div
            key={book._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="group"
          >
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              <BookCard
                book={{
                  _id: book._id,
                  title: book.title,
                  description: book.description,
                  coverImage: book.coverImage,
                  price: {
                    newPrice: book.price?.newPrice || 0,
                    oldPrice: book.price?.oldPrice || 0,
                  },
                  rating: Number(book.rating) || 0,
                  totalRatings: Number(book.totalRatings) || 0,
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* View More */}
      <motion.div
        className="text-center mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Link
          to="/product"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <FaEye />
          {t(`common.Explore More Books`)}
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default BookRecommendations;
