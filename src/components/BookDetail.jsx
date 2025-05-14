import React from "react";
import { useParams } from "react-router-dom";
import BookRecommendations from "./BookRecommendations";
// Giả định bạn có API để lấy chi tiết sách
import { useGetBookByIdQuery } from "../../redux/features/books/booksApi";

const BookDetail = () => {
  const { id } = useParams();
  const { data: book, isLoading, isError, error } = useGetBookByIdQuery(id);

  if (isLoading) return <div className="container mx-auto p-6">Loading...</div>;
  if (isError) return <div className="container mx-auto p-6 text-red-600">Error: {error?.data?.message}</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full md:w-1/3 h-64 object-cover rounded"
        />
        <div>
          <h1 className="text-3xl font-bold">{book.title}</h1>
          <p className="text-gray-600 mt-2">{book.description}</p>
          <p className="text-gray-800 font-semibold mt-2">
            Price: ${book.price.newPrice.toFixed(2)}
          </p>
          <p className="text-gray-600">Language: {book.language}</p>
          {/* Thêm các thông tin khác nếu cần */}
        </div>
      </div>
      <BookRecommendations bookId={id} />
    </div>
  );
};

export default BookDetail;