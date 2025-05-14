import React from "react";
import { useGetRecommendationsQuery } from "../redux/features/recommendations/recommendationsApi";
import { Link } from "react-router-dom";
import BookCard from './../pages/books/BookCart';

const BookRecommendations = ({ bookId }) => {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetRecommendationsQuery(bookId, {
    skip: !bookId,
  });

  const recommendations = data?.recommendations || [];

  if (isLoading) return <div className="container mx-auto p-6">Loading recommendations...</div>;
  if (isError) return (
    <div className="container mx-auto p-6 text-red-600">
      Error: {error?.data?.message || "Failed to load recommendations"}
    </div>
  );
  if (!recommendations.length) return (
    <div className="container mx-auto p-6 text-gray-600">
      No recommendations available
    </div>
  );

  return (
    <div className="container mx-auto p-6 bg-blue-100 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recommended Books</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {recommendations.map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>
    </div>
  );
};

export default BookRecommendations;