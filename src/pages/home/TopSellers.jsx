import React from "react";
import { Link } from "react-router-dom";
import { useGetBooksQuery } from "../../redux/features/books/booksApi";

const TopSellers = () => {
  const { data: books = [] } = useGetBooksQuery();

  // Sort books by sales or rating to get top sellers
  const topSellers = [...books]
    .sort((a, b) => (b.sales || 0) - (a.sales || 0))
    .slice(0, 4);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Top Sellers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topSellers.map((book) => (
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
      </div>
    </section>
  );
};

export default TopSellers;
