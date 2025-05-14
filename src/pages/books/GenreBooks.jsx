import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGetBooksQuery } from "../../redux/features/books/booksApi";
import Loading from "../../components/Loading";

const GenreBooks = () => {
  const { genre } = useParams();
  const { data: books = [], isLoading, isError } = useGetBooksQuery();
  const [sortBy, setSortBy] = useState("newest");

  if (isLoading) return <Loading />;
  if (isError) return <div>Error loading books</div>;

  // Filter books by genre
  const genreBooks = books.filter((book) => book.category === genre);

  // Sort books based on selected option
  const sortedBooks = [...genreBooks].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price.newPrice - b.price.newPrice;
      case "price-high":
        return b.price.newPrice - a.price.newPrice;
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      default:
        return 0;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 capitalize">{genre} Books</h1>
      
      {/* Sort options */}
      <div className="mb-6">
        <label htmlFor="sort" className="mr-2 font-medium">Sort by:</label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {sortedBooks.length === 0 ? (
        <p className="text-center text-gray-500">No books found in this genre.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedBooks.map((book) => (
            <Link
              key={book._id}
              to={`/books/${book._id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
                <p className="text-gray-600 mb-2">{book.author}</p>
                <p className="text-blue-600 font-bold">
                  ${book.price?.newPrice?.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenreBooks; 