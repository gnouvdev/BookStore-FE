import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Pagination, Navigation } from "swiper/modules";
import { useGetBooksQuery } from "../redux/features/books/booksApi";
import BookCard from "../pages/books/BookCart";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const GenreBooks = ({ genre }) => {
  const { data: books = [], isLoading, error } = useGetBooksQuery();
  const { t } = useTranslation();

  if (isLoading) return <p>{t('books.loading')}</p>;
  if (error) return <p className="text-red-500">{t('books.error')}</p>;

  const filteredBooks =
    genre === "full"
      ? books
      : books.filter(
          (book) => book.category?.name.toLowerCase() === genre.toLowerCase()
        );

  return (
    <div className="py-16 px-1 pt-4 mx-16">
      <div className="flex justify-between mx-8 ">
        <h2 className="text-2xl font-semibold mb-6 uppercase">
          {genre === "full" ? t('books.allBooks') : t(`books.${genre}Books`)}
        </h2>
        <Link
          to={`/product/${genre.toLowerCase()}`}
          className="hover:underline"
        >
          {t('common.view all')}
        </Link>
      </div>

      {filteredBooks.length === 0 ? (
        <p className="text-gray-500">No books available in this category.</p>
      ) : (
        <Swiper
          slidesPerView={1}
          spaceBetween={10}
          navigation={true}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 5 },
            768: { slidesPerView: 3, spaceBetween: 5 },
            1024: { slidesPerView: 4, spaceBetween: 5 },
            1180: { slidesPerView: 5, spaceBetween: 5 },
          }}
          modules={[Pagination, Navigation]}
          className="mySwiper"
        >
          {filteredBooks.map((book, index) => (
            <SwiperSlide key={index}>
              <BookCard book={book} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default GenreBooks;
