import React, { useState, useEffect } from "react";
import BookCard from "./../pages/books/BookCart";
import { useGetBooksQuery } from "../redux/features/books/booksApi";
import { useTranslation } from "react-i18next";
import Filter from "./Filter";

const GenreBooks = ({ genre }) => {
  const { data: books = [], isLoading, error } = useGetBooksQuery();
  const { t } = useTranslation();
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 1000000,
    language: '',
    author: '',
    sortBy: ''
  });

  useEffect(() => {
    if (books.length > 0) {
      let result = books;
      
      // Filter by genre
      if (genre !== "full") {
        result = result.filter(
          (book) => book.category?.name.toLowerCase() === genre.toLowerCase()
        );
      }

      // Apply price range filter
      result = result.filter(book => {
        const price = book.price.newPrice;
        return price >= filters.minPrice && price <= filters.maxPrice;
      });

      // Apply language filter
      if (filters.language) {
        result = result.filter(book => {
          const bookLanguage = book.language === "Tiếng Việt" ? "Vietnamese" : "English";
          return bookLanguage === filters.language;
        });
      }

      // Apply author filter
      if (filters.author === 'trending') {
        result = result.filter(book => book.trending);
      }

      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            result.sort((a, b) => a.price.newPrice - b.price.newPrice);
            break;
          case 'price_desc':
            result.sort((a, b) => b.price.newPrice - a.price.newPrice);
            break;
          case 'newest':
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
          case 'trending':
            result.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
            break;
          default:
            break;
        }
      }

      setFilteredBooks(result);
    }
  }, [books, genre, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (isLoading) return <p>{t('books.loading')}</p>;
  if (error) return <p className="text-red-500">{t('books.error')}</p>;

  return (
    <div className="flex gap-8">
      <Filter onFilterChange={handleFilterChange} />
      <div className="flex-1">
        <div className="py-16 px-1 pt-4">
          <h2 className="text-2xl font-semibold mb-6 mx-8 uppercase">
            {genre === "full" ? t('books.allBooks') : t(`books.${genre}Books`)}
          </h2>
          {filteredBooks.length === 0 ? (
            <p className="text-gray-500">No books available in this category.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-8">
              {filteredBooks.map((book, index) => (
                <BookCard key={index} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenreBooks;
