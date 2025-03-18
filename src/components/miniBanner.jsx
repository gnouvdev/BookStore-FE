import React from "react";
import Banner1 from "../assets/books/banner-1-1.png";
import Banner2 from "../assets/books/banner-1-2.png";
import Banner3 from "../assets/books/banner-2-1.png";
import Banner4 from "../assets/books/banner-2-2.png";
import Banner5 from "../assets/books/banner-5-1.png";
import Banner6 from "../assets/books/banner-5-2.png"

// Danh sách ảnh theo thể loại
const genreImages = {
  Business1: Banner1,
  Business2: Banner2,
  Horror1: Banner3,
  Horror2: Banner4,
  Adventure1: Banner5, 
  Adventure2: Banner6, // Sửa lỗi chính tả từ "Aventure" -> "Adventure"
};

const MiniBanner = ({ genre1, genre2 }) => {
  const imageSrc1 = genreImages[genre1] || null;
  const imageSrc2 = genreImages[genre2] || null;

  return (
    <div className="py-16 mx-8">
      <div className="grid md:grid-cols-2 grid-cols-1  items-center ">
        {imageSrc1 && (
          <div className="w-full flex justify-center items-center">
            <img
              src={imageSrc1}
              alt={`Banner for ${genre1}`}
              className="w-300 object-cover rounded-lg shadow-md"
            />
          </div>
        )}
        {imageSrc2 && (
          <div className="w-full flex justify-center items-center">
            <img
              src={imageSrc2}
              alt={`Banner for ${genre2}`}
              className="w-300 object-cover rounded-lg shadow-md"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniBanner;
