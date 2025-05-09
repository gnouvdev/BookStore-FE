import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import BookCard from './BookCart';

const SearchBooks = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query");

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      axios
        .post("http://localhost:5000/api/books/search", { title: query })
        .then((response) => {
          setBooks(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching books:", error);
          setLoading(false);
        });
    }
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold mb-4">Kết quả tìm kiếm cho: "{query}"</h2>
      {loading ? (
        <p>Đang tìm kiếm...</p>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 px-8">
          {books.map((book,index) => (
            <BookCard key={index} book={book} />
          ))}
          </div>
      ) : (
        <p>Không tìm thấy sách nào.</p>
      )}
    </div>
  );
};

export default SearchBooks;
