import React from "react";
import BannerImg from "../../assets/banner.png";
import Banner1 from "../../assets/books/banner-1.png";
import img1 from "../../assets/books/banner-3.png"
import img2 from "../../assets/books/banner-4.png"
import img3 from "../../assets/books/banner-5.png"
import img4 from "../../assets/books/banner-6.png"
import img5 from "../../assets/books/banner-7.png"
import book1 from "../../assets/books/book-1.png"
import book2 from "../../assets/books/book-2.png"
import book3 from "../../assets/books/book-3.png"
import GenreBooks from "../../components/GenreBooks";
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';


// import required modules
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

const Banner = () => {
  return (
//swiper



    <div className="flex flex-col py-2 items-center gap-12 mx-8 pb-14">
      <Swiper
        spaceBetween={30}
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
        className="mySwiper"
      >
        <SwiperSlide><img src={img1}/></SwiperSlide>
        <SwiperSlide><img src={img2}/></SwiperSlide>
        <SwiperSlide><img src={img3}/></SwiperSlide>
        <SwiperSlide><img src={img4}/></SwiperSlide>
        <SwiperSlide><img src={img5}/></SwiperSlide>
 
      </Swiper>
      {/* Ảnh banner-1 full chiều ngang */}
      {/* <div className="w-full">
        <img
          src={Banner1}
          alt="Banner 1"
          className="w-full h-auto object-cover"
        />
      </div> */}

      {/* Phần chính của banner */}
      {/* <div className="flex flex-col md:flex-row justify-between items-center gap-12 w-full">
        <div className="md:w-1/2 w-full">
          <h1 className="md:text-5xl text-2xl font-medium mb-7">
            New Releases This Week
          </h1>
          <p className="mb-10">
            It's time to update your reading list with some of the latest and
            greatest releases in the literary world. From heart-pumping
            thrillers to captivating memoirs, this week's new releases offer
            something for everyone.
          </p>
          <button className="btn-primary">Subscribe</button>
        </div>
        <div className="md:w-1/2 w-full flex items-center md:justify-end">
        <Swiper
        effect={'cards'}
        grabCursor={true}
        modules={[EffectCards]}
        className="mySwiper"
      >
        <SwiperSlide><img
            src={BannerImg}
            alt="Main Banner"
            className="max-w-full h-auto"
          /></SwiperSlide>
        <SwiperSlide>Slide 2</SwiperSlide>

      </Swiper>
          
        </div>
      </div> */}
    </div>
  );
};

export default Banner;
