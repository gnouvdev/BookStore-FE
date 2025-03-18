import React from "react";

import BookCard from "./../pages/books/BookCart";
import { useFetchAllBooksQuery } from "../redux/features/books/booksApi";
import { data } from "react-router-dom";

const GenreBooks = ({ genre }) => {
  const { data: books = [], isLoading, error } = useFetchAllBooksQuery();

  if (isLoading) return <p>Loading books...</p>;
  if (error) return <p className="text-red-500">Failed to load books</p>;

  const filteredBooks =
    genre === "full"
      ? books
      : books.filter(
          (book) => book.category?.toLowerCase() === genre.toLowerCase()
        );

  return (
    <div className="py-16 px-1 pt-4">
      <h2 className="text-2xl font-semibold mb-6 mx-8 uppercase">
        {genre === "full" ? "All Books" : `${genre} Books`}
      </h2>
      {filteredBooks.length === 0 ? (
        <p className="text-gray-500">No books available in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 px-8">
          {filteredBooks.map((book, index) => (
            <BookCard key={index} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GenreBooks;
