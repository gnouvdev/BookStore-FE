import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useSearchBooksQuery } from "../../redux/features/search/searchApi";
import BookCard from "./BookCart";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SearchBooks = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query");

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    data: books = [],
    isLoading,
    error,
  } = useSearchBooksQuery({ query: query || "" }, { skip: !query });

  // Pagination logic
  const totalPages = Math.ceil(books.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = books.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Pagination component
  const Pagination = () => {
    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-between px-6 py-4 mt-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Hiển thị {startIndex + 1} đến {Math.min(endIndex, books.length)}{" "}
            trong tổng số {books.length} kết quả
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(e.target.value)}
            className="px-3 py-1 border rounded-lg bg-white"
          >
            <option value="10">10 mỗi trang</option>
            <option value="20">20 mỗi trang</option>
            <option value="30">30 mỗi trang</option>
            <option value="50">50 mỗi trang</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Trước
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && handlePageChange(page)}
              disabled={page === "..."}
              className={`px-3 py-1 border rounded-lg ${
                page === currentPage
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-gray-50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-1"
          >
            Sau
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold mb-4">
        Kết quả tìm kiếm cho: "{query || "Không có từ khóa"}"
      </h2>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">
            {error.data?.message ||
              "Không thể tải kết quả tìm kiếm. Vui lòng thử lại sau."}
          </p>
        </div>
      ) : books && books.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 px-8">
            {currentBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
          <Pagination />
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Không tìm thấy sách nào.</p>
        </div>
      )}
    </div>
  );
};

export default SearchBooks;
