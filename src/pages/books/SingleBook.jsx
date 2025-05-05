import React, { useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { useFetchBookByIdQuery } from "../../redux/features/books/booksApi";
import { IoMdStar } from "react-icons/io";
import { FaBuilding } from "react-icons/fa";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import GenreBooks from "../../components/GenreBooks";

const SingleBook = () => {
  const { id } = useParams();
  const { data: book, isLoading, isError } = useFetchBookByIdQuery(id);
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, quantityToAdd: quantity })); // Truyền số lượng đã chọn
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error happending to load book info</div>;

  return (
    <div className="w-full container mx-auto">
      <div className="w-full shadow-md flex flex-col md:flex-row gap-8 p-6 bg-white rounded-lg mb-5">
        {/* Left: Book Image */}
        <img
          src={book?.coverImage}
          alt={book?.title}
          className="object-cover w-[300px] h-[370px] rounded-lg shadow-lg"
        />

        {/* Right: Book Details */}
        <div className="w-full flex flex-col justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-2 uppercase">{book?.title}</h1>
            <p className="text-gray-700 text-sm mb-2">
              <strong>Author:</strong> {book?.author?.name || "Unknown"}
            </p>

            {/* Rating */}
            <div className="flex mb-4">
              {[...Array(5)].map((_, index) => (
                <IoMdStar key={index} className="text-yellow-300 text-2xl" />
              ))}
            </div>

            <p className="text-gray-700 mb-2">
              <strong>Published:</strong>{" "}
              {new Date(book?.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-700 mb-2 capitalize">
              <strong>Category:</strong> {book?.category?.name || "Unknown"}
            </p>
            <p className="font-medium mb-3 text-5xl text-red-500">
              ${book?.price?.newPrice}{" "}
              <span className="line-through font-normal ml-2 text-xl">
                ${book?.price?.oldPrice}
              </span>
            </p>

            {/* Description with max length */}
            <p className="text-gray-700 mb-6">
              <strong>Description:</strong>{" "}
              {book?.description?.length > 200
                ? book.description.slice(0, 200) + "..."
                : book?.description}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleDecrease}
                className="px-3 py-1 bg-gray-300 text-lg rounded"
              >
                -
              </button>
              <span className="text-xl font-semibold">{quantity}</span>
              <button
                onClick={handleIncrease}
                className="px-3 py-1 bg-gray-300 text-lg rounded"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => handleAddToCart(book)}
            className="btn-primary w-[220px] px-6 py-2 flex items-center gap-2 justify-center mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FiShoppingCart />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
      <div className="bg-white text-gray-700 mt-8 px-8 py-6 flex justify-end flex-col gap-2 text-sm rounded-lg shadow-md border border-gray-200">
        <p className="font-semibold text-yellow-600">
          Free nationwide express delivery for orders over 20$
        </p>
        <div className="flex gap-2 items-center">
          <FaBuilding className="text-yellow-600 text-xl " />
          <span>Within the city can receive goods within 1-2 days</span>
        </div>
        <div className="flex gap-2 items-center">
          <IoShieldCheckmarkSharp className="text-yellow-600 text-xl " />
          <span>In other provinces, receive goods from 2-5 days</span>
        </div>
      </div>
      <GenreBooks genre={book?.category?.name} />
    </div>
  );
};

export default SingleBook;
