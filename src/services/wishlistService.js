import axios from "axios";
import baseUrl from "../../src/utils/baseURL.js";

// Tạo instance axios với config mặc định
const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const addToWishlist = async (bookId) => {
  try {
    console.log("Adding to wishlist, bookId:", bookId);
    const response = await axiosInstance.post("/users/wishlist", { bookId });
    console.log("Add to wishlist response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error adding to wishlist:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

const removeFromWishlist = async (bookId) => {
  try {
    console.log("Removing from wishlist, bookId:", bookId);
    const response = await axiosInstance.delete("/users/wishlist", {
      data: { bookId },
    });
    console.log("Remove from wishlist response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error removing from wishlist:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

const getWishlist = async () => {
  try {
    console.log("Fetching wishlist...");
    const response = await axiosInstance.get("/users/profile");
    console.log("User profile response:", response.data);

    const wishlist = response.data.user.wishlist || [];
    console.log("Wishlist:", wishlist);

    if (!wishlist || wishlist.length === 0) {
      console.log("No books in wishlist");
      return [];
    }

    // Nếu wishlist đã được populate từ server, trả về trực tiếp
    if (wishlist[0].title) {
      console.log("Wishlist already populated:", wishlist);
      return wishlist;
    }

    // Nếu wishlist chỉ chứa IDs, lấy thông tin chi tiết của từng cuốn sách
    const booksPromises = wishlist.map((id) =>
      axiosInstance.get(`/books/${id}`).then((res) => res.data)
    );

    const books = await Promise.all(booksPromises);
    console.log("Fetched books:", books);
    return books;
  } catch (error) {
    console.error(
      "Error fetching wishlist:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

export const wishlistService = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};
