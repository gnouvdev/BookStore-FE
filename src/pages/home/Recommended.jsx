import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaFire } from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import { useGetBooksQuery } from "../../redux/features/books/booksApi";
import { t } from "i18next";
import BookCard from './../books/BookCart';

const Recommended = () => {
  const { data: books = [], isLoading } = useGetBooksQuery();

  // Tính phần trăm giảm giá và sắp xếp sách
  const discountedBooks = books
    .map(book => ({
      ...book,
      discountPercentage: book.price?.oldPrice && book.price?.newPrice
        ? ((book.price.oldPrice - book.price.newPrice) / book.price.oldPrice) * 100
        : 0
    }))
    .filter(book => book.discountPercentage > 0)
    .sort((a, b) => b.discountPercentage - a.discountPercentage)
    .slice(0, 10); // Lấy top 10 sách giảm giá nhiều nhất

  if (isLoading) return (
    <div className="bg-red-600 p-12 rounded-3xl mx-16 text-center">
      <div className="animate-pulse text-white text-lg">{t("loading")}</div>
    </div>
  );

  return (
    <div className="bg-red-600 p-8 sm:p-12 rounded-3xl mx-4 sm:mx-8 lg:mx-16">
      <h2 className="text-2xl sm:text-3xl text-white font-semibold mb-6 relative inline-block">
        {t("home.Top Sales")}
        <span className="absolute -top-3 -right-6 text-yellow-300 text-xl animate-bounce">
          <FaFire className="text-3xl sm:text-4xl" />
        </span>
      </h2>

      {discountedBooks.length > 0 ? (
        <Swiper
          slidesPerView={1}
          spaceBetween={10}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 15 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 20 },
          }}
          centeredSlides={true}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper"
        >
          {discountedBooks.map((book) => (
            <SwiperSlide key={book._id}>
              <BookCard book={book} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-white text-center text-lg py-8">
          {t("home.no_discounts")}
        </p>
      )}
    </div>
  );
};

export default Recommended;