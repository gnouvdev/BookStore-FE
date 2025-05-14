import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaFire } from "react-icons/fa"; // Import icon
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import BookCart from "../books/BookCart";
import { useGetBooksQuery } from "../../redux/features/books/booksApi";
import { t } from "i18next";

const Recommended = () => {
  const [selectedCategory, setSelectedCategory] = useState("Choose");
  const { data: books = [] } = useGetBooksQuery();
  return (
    <div className="bg-red-600 p-12 rounded-3xl mx-16 gap-5">
      <h2 className="text-3xl text-white font-semibold mb-6 relative inline-block">
        {t("home.Top Sales")}
        <span className="absolute -top-3 -right-6 text-yellow-300 text-xl animate-bounce">
          <FaFire className="text-4xl" />
        </span>
      </h2>

      <Swiper
        slidesPerView={4}
        spaceBetween={20}
        centeredSlides={true}
        autoplay={{
          delay: 1500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper "
      >
        {books.map((book, index) => (
          <SwiperSlide key={index}>
            <BookCart book={book} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Recommended;
