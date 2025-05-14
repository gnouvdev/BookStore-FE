import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
} from "../../../redux/features/categories/categoriesApi";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: category, isLoading, isError } = useGetCategoryByIdQuery(id);
  const [updateCategory] = useUpdateCategoryMutation();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await updateCategory({ id, ...data }).unwrap();
      Swal.fire({
        title: "Success!",
        text: "Category updated successfully",
        icon: "success",
      });
      navigate("/dashboard/manage-categories");
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error?.data?.message || "Something went wrong",
        icon: "error",
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading category</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-6">Edit Category</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            defaultValue={category?.name}
            {...register("name", { required: "Name is required" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            defaultValue={category?.description}
            {...register("description")}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard/manage-categories")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Update Category
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCategory;