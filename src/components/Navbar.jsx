import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiBars3CenterLeft } from "react-icons/hi2";
import { IoSearchOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa6";
import { FaCartShopping } from "react-icons/fa6";
import avatarImg from "../assets/avatar.png";
import logo from "../assets/books/logo.png";
import { useSelector } from "react-redux";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Orders", href: "/order" },
  { name: "Cart Page", href: "/cart" },
  { name: "Check Out", href: "/checkout" },
];

const Navbar = () => {
  const [isDropdownOpen, setisDropdownOpen] = useState(false);
  const cartItems = useSelector((state) => state.cart.cartItems);

  const currentuser = true;

  return (
    <header className="max-w-screen-2xl mx-auto px-4 py-6">
      <nav className="flex justify-between items-center">
        {/* //left */}
        <div className="flex items-center md:gap-10">
          <Link to="/">
          <img className="w-16 object-cover ml-8" src={logo} alt="" />

          </Link>
          {/*  search input */}
          <div className="relative sm:w-72 w-40">
            <IoSearchOutline className="absolute inline-block left-3 inset-y-2" />
            <input
              type="text"
              placeholder="Search here"
              className="bg-[#EAEAEA] w-full py-1 md:px-8 px-6 rounded-md focus:outline"
            ></input>
          </div>
          <Link to="/">Home</Link>
          <Link to="/product">Product</Link>
          <Link to="/product/business">Business</Link>
          
        </div>
        {/* //right */}
        <div className="relative flex items-center md:space-x-2">
          <div>
            {currentuser ? (
              <>
                <button onClick={() => setisDropdownOpen(!isDropdownOpen)}>
                  <img
                    src={avatarImg}
                    alt=""
                    className={`size-7 rounded-full ${
                      currentuser ? "ring-2 ring-blue-600" : ""
                    }`}
                  />
                </button>
                {/* show dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-40">
                    <ul className="py-2">
                      {navigation.map((item) => (
                        <li
                          key={item.name}
                          onClick={() => setisDropdownOpen(false)}
                        >
                          <Link
                            to={item.href}
                            className="block px-4 py-2 text-sm hover:bg-gray-300"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login">
                <FaRegUser className="size-6" />
              </Link>
            )}
          </div>

          <button className="hidden sm:block">
            {" "}
            <FaRegHeart className="size-6" />
          </button>
          <Link
            to="/cart"
            className="bg-primary p-1 sm:px-6 px-2 flex items-center rounded-sm"
          >
            <FaCartShopping />
            {
              cartItems.length > 0 ?  <span className="text-sm font-semibold sm:ml-1">{cartItems.length}</span> : <span className="text-sm font-semibold sm:ml-1">0</span>
            }
           
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
