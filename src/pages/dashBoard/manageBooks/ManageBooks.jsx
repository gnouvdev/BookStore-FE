import React, { useState, useEffect } from "react";
import {
  useGetBooksQuery,
  useDeleteBookMutation,
  useSearchBooksQuery,
} from "../../../redux/features/books/booksApi";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Loading from "../../../components/Loading";
import Swal from "sweetalert2";

const ManageBooks = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    data: books,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetBooksQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: searchResults } = useSearchBooksQuery(searchQuery, {
    skip: !searchQuery || !isAuthenticated,
  });
  const [deleteBook] = useDeleteBookMutation();

  // Handle authentication errors
  if (isError) {
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
      <div>Error loading books: {error?.data?.message || "Unknown error"}</div>
    );
  }

  if (!isAuthenticated || isLoading) return <Loading />;

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const displayBooks = searchQuery ? searchResults || [] : books || [];

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await deleteBook(id).unwrap();
        toast.success("Book deleted successfully!");
        refetch();
      }
    } catch (error) {
      console.error("Failed to delete book:", error);
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
      } else {
        toast.error("Failed to delete book. Please try again.");
      }
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Book list refreshed!");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Books</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={handleSearch}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={handleRefresh}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            Refresh List
          </button>
        </div>
      </div>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">#</th>
            <th className="border border-gray-300 px-4 py-2">Image</th>
            <th className="border border-gray-300 px-4 py-2">Title</th>
            <th className="border border-gray-300 px-4 py-2">Author</th>
            <th className="border border-gray-300 px-4 py-2">Category</th>
            <th className="border border-gray-300 px-4 py-2">Price</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayBooks.map((book, index) => (
            <tr key={book._id}>
              <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
              <td className="border border-gray-300 px-4 py-2">
                <img
                  src={book.coverImage || "https://via.placeholder.com/100"}
                  alt={book.title}
                  className="w-16 h-19 object-cover"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">{book.title}</td>
              <td className="border border-gray-300 px-4 py-2">
                {book.author?.name || "Unknown"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {book.category?.name || "Unknown"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {book.price?.newPrice.toLocaleString("vi-VN") || "N/A"}đ
              </td>
              <td className="border border-gray-300 px-4 py-2 space-x-2">
                <Link
                  to={`/dashboard/edit-book/${book._id}`}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(book._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageBooks;
