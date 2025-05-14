import React from "react";
import img1 from "../../assets/books/banner-3.png";
import img2 from "../../assets/books/banner-4.png";
import img3 from "../../assets/books/banner-5.png";
import img4 from "../../assets/books/banner-6.png";
import img5 from "../../assets/books/banner-7.png";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Banner = () => {
  return (
    <div className="flex flex-col py-2 items-center gap-12 mx-8 pb-14">
      <Swiper
        spaceBetween={10}
        slidesPerView={1}
        centeredSlides={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="w-full max-w-[1390px]  h-[600px] md:h-[500px]" // Giới hạn kích thước
      >
        <SwiperSlide>
          <img
            src={img1}
            alt="Banner 3"
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src={img2}
            alt="Banner 4"
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src={img3}
            alt="Banner 5"
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src={img4}
            alt="Banner 6"
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src={img5}
            alt="Banner 7"
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default Banner;