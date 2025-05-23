import React, { useState, useEffect } from "react";
import {
  useGetAuthorsQuery,
  useAddAuthorMutation,
  useUpdateAuthorMutation,
  useDeleteAuthorMutation,
  useSearchAuthorsQuery,
} from "../../../redux/features/authors/authorsApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import Loading from "../../../components/Loading";

const ManageAuthors = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
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
    data: authors,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAuthorsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: searchResults } = useSearchAuthorsQuery(searchQuery, {
    skip: !searchQuery || !isAuthenticated,
  });
  const [addAuthor, { isLoading: isAdding }] = useAddAuthorMutation();
  const [updateAuthor, { isLoading: isUpdating }] = useUpdateAuthorMutation();
  const [deleteAuthor, { isLoading: isDeleting }] = useDeleteAuthorMutation();

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
      <div className="text-red-500">
        Error: {error.data?.message || "Failed to load authors"}
      </div>
    );
  }

  if (!isAuthenticated || isLoading) return <Loading />;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAuthor) {
        await updateAuthor({ id: editingAuthor._id, ...formData }).unwrap();
        toast.success("Author updated successfully!");
      } else {
        await addAuthor(formData).unwrap();
        toast.success("Author added successfully!");
      }
      setIsModalOpen(false);
      setFormData({ name: "", bio: "" });
      setEditingAuthor(null);
      refetch();
    } catch (error) {
      console.error("Error:", error);
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
        toast.error(error.data?.message || "Something went wrong!");
      }
    }
  };

  const handleEdit = (author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name,
      bio: author.bio || "",
    });
    setIsModalOpen(true);
  };

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
        await deleteAuthor(id).unwrap();
        toast.success("Author deleted successfully!");
        refetch();
      }
    } catch (error) {
      console.error("Error:", error);
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
        toast.error(error.data?.message || "Failed to delete author!");
      }
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const displayAuthors = searchQuery ? searchResults || [] : authors || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Authors</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search authors..."
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
            onClick={() => {
              setEditingAuthor(null);
              setFormData({ name: "", bio: "" });
              setIsModalOpen(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={isAdding || isUpdating}
          >
            Add New Author
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayAuthors.map((author) => (
              <tr key={author._id}>
                <td className="px-6 py-4 whitespace-nowrap">{author.name}</td>
                <td className="px-6 py-4">{author.bio || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(author)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                    disabled={isUpdating || isDeleting}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(author._id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={isUpdating || isDeleting}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                {editingAuthor ? "Edit Author" : "Add New Author"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    disabled={isAdding || isUpdating}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows="3"
                    disabled={isAdding || isUpdating}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    disabled={isAdding || isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={isAdding || isUpdating}
                  >
                    {isAdding || isUpdating
                      ? "Processing..."
                      : editingAuthor
                      ? "Update"
                      : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAuthors;
