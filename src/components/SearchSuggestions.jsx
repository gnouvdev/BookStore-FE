import React from "react";
import { Link } from "react-router-dom";
import { FaBook, FaUser, FaTag, FaList } from "react-icons/fa";

const SearchSuggestions = ({ suggestions, onSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md mt-1 z-50 max-h-96 overflow-y-auto">
      {suggestions.books && suggestions.books.length > 0 && (
        <div className="p-2">
          <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
            <FaBook className="mr-2" /> Books
          </h3>
          {suggestions.books.map((book) => (
            <Link
              key={book._id}
              to={`/books/${book._id}`}
              className="block p-2 hover:bg-gray-100 rounded-md"
              onClick={() => onSelect(book.title)}
            >
              <div className="flex items-center">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-10 h-14 object-cover rounded mr-3"
                />
                <div>
                  <p className="font-medium">{book.title}</p>
                  <p className="text-sm text-gray-500">{book.author?.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {suggestions.authors && suggestions.authors.length > 0 && (
        <div className="p-2 border-t">
          <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
            <FaUser className="mr-2" /> Authors
          </h3>
          {suggestions.authors.map((author) => (
            <Link
              key={author._id}
              to={`/author/${author._id}`}
              className="block p-2 hover:bg-gray-100 rounded-md"
              onClick={() => onSelect(author.name)}
            >
              <p className="font-medium">{author.name}</p>
            </Link>
          ))}
        </div>
      )}

      {suggestions.categories && suggestions.categories.length > 0 && (
        <div className="p-2 border-t">
          <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
            <FaList className="mr-2" /> Categories
          </h3>
          {suggestions.categories.map((category) => (
            <Link
              key={category._id}
              to={`/category/${category._id}`}
              className="block p-2 hover:bg-gray-100 rounded-md"
              onClick={() => onSelect(category.name)}
            >
              <p className="font-medium">{category.name}</p>
            </Link>
          ))}
        </div>
      )}

      {suggestions.tags && suggestions.tags.length > 0 && (
        <div className="p-2 border-t">
          <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
            <FaTag className="mr-2" /> Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.tags.map((tag, index) => (
              <Link
                key={index}
                to={`/search?tag=${tag}`}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                onClick={() => onSelect(tag)}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
