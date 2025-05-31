import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetBookByIdQuery,
  useUpdateBookMutation,
} from "../../../redux/features/books/booksApi";
import { useGetAuthorsQuery } from "../../../redux/features/authors/authorsApi";
import { useGetCategoriesQuery } from "../../../redux/features/categories/categoriesApi";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import Loading from "../../../components/Loading";

const UpdateBook = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    image: null,
  });

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user || user.role !== "admin") {
      Swal.fire({
        title: "Unauthorized",
        text: "Please log in as admin",
        icon: "error",
        confirmButtonText: "Go to Login",
      }).then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/admin");
      });
      return;
    }

    setIsAuthenticated(true);
  }, [navigate]);

  const {
    data: book,
    isLoading: isLoadingBook,
    isError: isBookError,
    error: bookError,
  } = useGetBookByIdQuery(id, {
    skip: !isAuthenticated,
  });
  const {
    data: authors,
    isLoading: isLoadingAuthors,
    isError: isAuthorsError,
    error: authorsError,
  } = useGetAuthorsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    error: categoriesError,
  } = useGetCategoriesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();

  // Update form data when book data is loaded
  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author?._id || "",
        category: book.category?._id || "",
        price: book.price || "",
        stock: book.stock || "",
        description: book.description || "",
        image: null,
      });
    }
  }, [book]);

  // Handle authentication errors
  if (isBookError || isAuthorsError || isCategoriesError) {
    const error = bookError || authorsError || categoriesError;
    if (error?.status === 401 || error?.status === 403) {
      Swal.fire({
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
        icon: "error",
        confirmButtonText: "Go to Login",
      }).then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/admin");
      });
      return null;
    }
    return (
      <div className="text-red-500">
        Error: {error.data?.message || "Failed to load data"}
      </div>
    );
  }

  if (
    !isAuthenticated ||
    isLoadingBook ||
    isLoadingAuthors ||
    isLoadingCategories
  )
    return <Loading />;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await updateBook({ id, ...formDataToSend }).unwrap();
      toast.success("Sách đã được cập nhật thành công!");
      navigate("/dashboard/manage-books");
    } catch (error) {
      console.error("Lỗi:", error);
      if (error?.status === 401 || error?.status === 403) {
        Swal.fire({
          title: "Phiên đăng nhập đã hết hạn",
          text: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          icon: "error",
          confirmButtonText: "Đi đến Đăng nhập",
        }).then(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/admin");
        });
      } else {
        toast.error(error.data?.message || "Không thể cập nhật sách!");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Cập nhật sách</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Tên sách
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={isUpdating}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Tác giả
          </label>
          <select
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={isUpdating}
          >
            <option value="">Chọn tác giả</option>
            {authors?.map((author) => (
              <option key={author._id} value={author._id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Thể loại
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={isUpdating}
          >
              <option value="">Chọn thể loại</option>
            {categories?.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Giá
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            min="0"
            step="0.01"
            disabled={isUpdating}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Tồn kho
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            min="0"
            disabled={isUpdating}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Mô tả
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="4"
            required
            disabled={isUpdating}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Hình ảnh
          </label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            accept="image/*"
            disabled={isUpdating}
          />
          {book?.image && !formData.image && (
            <div className="mt-2">
              <img
                src={book.image}
                alt="Current Book Cover"
                className="max-w-full h-40 object-contain"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard/manage-books")}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            disabled={isUpdating}
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={isUpdating}
          >
            {isUpdating ? "Đang cập nhật..." : "Cập nhật sách"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateBook;
