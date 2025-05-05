import React, { useState } from "react";

import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { useAddAuthorMutation, useDeleteAuthorMutation, useFetchAllAuthorsQuery } from "../../../redux/features/Author/authorApi";
import { BsFileEarmarkPersonFill } from "react-icons/bs";


const ManageAuthors = () => {
  const { data: authors, refetch } = useFetchAllAuthorsQuery();
  const [deleteAuthor] = useDeleteAuthorMutation();
  const [addAuthor, { isLoading: isAdding }] = useAddAuthorMutation();
  const { register, handleSubmit, reset } = useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteAuthor = async (id) => {
    try {
      await deleteAuthor(id).unwrap();
      Swal.fire("Deleted!", "Author deleted successfully!", "success");
      refetch();
    } catch (error) {
      console.error("Failed to delete author:", error.message);
      Swal.fire("Error", "Failed to delete author. Please try again.", "error");
    }
  };

  const onSubmit = async (data) => {
    try {
      await addAuthor(data).unwrap();
      Swal.fire("Success", "Author added successfully!", "success");
      reset();
      setIsModalOpen(false); // Close modal after successful addition
      refetch();
    } catch (error) {
      console.error("Failed to add author:", error);
      Swal.fire("Error", "Failed to add author. Please try again.", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Authors</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add Author
        </button>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-gray-300 table-auto">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">#</th>
            <th className="border border-gray-300 px-4 py-2">Author Name</th>
            <th className="border border-gray-300 px-4 py-2">Bio</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {authors &&
            authors.map((author, index) => (
              <tr key={author._id}>
                <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">{author.name}</td>
                <td className="border border-gray-300 px-4 py-2">{author.bio}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex justify-center space-x-2">
                    <Link
                      to={`/dashboard/edit-author/${author._id}`}
                      className="text-blue-500 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteAuthor(author._id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Author</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Author Name</label>
                <input
                  type="text"
                  {...register("name", { required: true })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter author name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Bio</label>
                <textarea
                  {...register("bio", { required: true })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter author bio"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {isAdding ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAuthors;