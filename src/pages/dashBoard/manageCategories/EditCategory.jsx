import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import {
  useFetchCategoryByIdQuery,
  useUpdateCategoryMutation,
} from "../../../redux/features/categories/categoriesApi";
import Swal from "sweetalert2";

const EditCategory = () => {
  const { id } = useParams();
  const { data: category, isLoading, isError } = useFetchCategoryByIdQuery(id);
  const [updateCategory] = useUpdateCategoryMutation();
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    if (category) {
      setValue("name", category.name);
      setValue("description", category.description);
    }
  }, [category, setValue]);

  const onSubmit = async (data) => {
    try {
      await updateCategory({ id, ...data }).unwrap();
      Swal.fire("Category Updated", "Category has been updated successfully!", "success");
    } catch (error) {
      console.error("Failed to update category:", error);
      Swal.fire("Error", "Failed to update category. Please try again.", "error");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading category data.</div>;

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Edit Category</h2>
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
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white font-bold rounded-md"
        >
          Update Category
        </button>
      </form>
    </div>
  );
};

export default EditCategory;