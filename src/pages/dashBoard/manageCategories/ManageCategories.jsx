import React, { useState } from "react";
import { useFetchAllCategoriesQuery, useDeleteCategoryMutation, useAddCategoryMutation } from "../../../redux/features/categories/categoriesApi";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";

const ManageCategories = () => {
  const { data: categories, refetch } = useFetchAllCategoriesQuery();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation();
  const { register, handleSubmit, reset } = useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteCategory = async (id) => {
    try {
      await deleteCategory(id).unwrap();
      Swal.fire("Deleted!", "Category deleted successfully!", "success");
      refetch();
    } catch (error) {
      console.error("Failed to delete category:", error.message);
      Swal.fire("Error", "Failed to delete category. Please try again.", "error");
    }
  };

  const onSubmit = async (data) => {
    try {
      await addCategory(data).unwrap();
      Swal.fire("Success", "Category added successfully!", "success");
      reset();
      setIsModalOpen(false); // Đóng modal sau khi thêm thành công
      refetch();
    } catch (error) {
      console.error("Failed to add category:", error);
      Swal.fire("Error", "Failed to add category. Please try again.", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Categories</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add Category
        </button>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">#</th>
            <th className="border border-gray-300 px-4 py-2">Category Name</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories &&
            categories.map((category, index) => (
              <tr key={category._id}>
                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2">{category.name}</td>
                <td className="border border-gray-300 px-4 py-2">{category.description}</td>
                <td className="border border-gray-300 px-4 py-2 space-x-2">
                  <Link
                    to={`/dashboard/edit-category/${category._id}`}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Category</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Category Name</label>
                <input
                  type="text"
                  {...register("name", { required: true })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter category name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Description</label>
                <input
                  type="text"
                  {...register("description", { required: true })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter description"
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

export default ManageCategories;