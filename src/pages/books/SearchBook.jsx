import React from "react";
import { useLocation } from "react-router-dom";
import { useSearchBooksQuery } from "../../redux/features/search/searchApi";
import BookCard from "./BookCart";

const SearchBooks = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query");

  const {
    data: books,
    isLoading,
    error,
  } = useSearchBooksQuery({ query: query || "" }, { skip: !query });

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold mb-4">
        Kết quả tìm kiếm cho: "{query || "Không có từ khóa"}"
      </h2>
      {isLoading ? (
        <p>Đang tìm kiếm...</p>
      ) : error ? (
        <p className="text-red-500">
          {error.data?.message ||
            "Không thể tải kết quả tìm kiếm. Vui lòng thử lại sau."}
        </p>
      ) : books && books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 px-8">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      ) : (
        <p>Không tìm thấy sách nào.</p>
      )}
    </div>
  );
};

export default SearchBooks;
