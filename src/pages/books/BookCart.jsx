import React from "react";
import { FiShoppingCart } from "react-icons/fi";
import { getImgUrl } from "../../utils/getImgUrl";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";

const BookCard = ({ book }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  return (
    <div className="bg-gray-100 rounded-xl p-4 mx-8 shadow-md w-60 max-w-xs h-full flex flex-col justify-between">
      <div className="flex flex-col items-center gap-3 h-full">
        {/* Hình ảnh sách */}
        <div className="h-56 w-40 flex-shrink-0 border rounded-md overflow-hidden">
          <Link to={`/books/${book._id}`}>
            <img
              src={`${getImgUrl(book?.coverImage)}`}
              alt={book?.title}
              className="w-full h-full object-cover p-2 cursor-pointer hover:scale-105 transition-all duration-200"
            />
          </Link>
        </div>

        {/* Thông tin sách */}
        <div className="flex flex-col items-center text-center flex-1 w-full">
          <Link to={`/books/${book._id}`}>
            <h3 className="text-lg font-medium hover:text-blue-600 mb-2 truncate w-48">
              {book?.title}
            </h3>
          </Link>
          <p className="text-gray-500 text-sm mb-3 line-clamp-3 h-[60px] w-48">
            {book?.description}
          </p>
          <p className="font-medium mb-3 text-sm">
            ${book?.newPrice}{" "}
            <span className="line-through font-normal ml-2 text-xs">
              $ {book?.oldPrice}
            </span>
          </p>
        </div>
      </div>

      {/* Nút Thêm vào giỏ hàng */}
      <button
        onClick={() => handleAddToCart(book)}
        className="bg-primary text-black px-4 py-2 text-sm rounded-lg flex items-center gap-1 hover:bg-blue-900 transition w-full"
      >
        <FiShoppingCart />
        <span>Add to Cart</span>
      </button>
    </div>
  );
};

export default BookCard;
