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
        title: "Thành công!",
        text: "Thể loại đã được cập nhật thành công",
        icon: "success",
      });
      navigate("/dashboard/manage-categories");
    } catch (error) {
      Swal.fire({
        title: "Lỗi!",
        text: error?.data?.message || "Đã xảy ra lỗi",
        icon: "error",
      });
    }
  };

  if (isLoading) return <div>Đang tải...</div>;
  if (isError) return <div>Lỗi khi tải thể loại</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-6">Sửa thể loại</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên</label>
          <input
            type="text"
            defaultValue={category?.name}
            {...register("name", { required: "Tên là bắt buộc" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Mô tả</label>
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
            Hủy bỏ
          </button>
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Cập nhật thể loại
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCategory;