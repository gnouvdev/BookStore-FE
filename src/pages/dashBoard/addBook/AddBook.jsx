import React, { useState, useEffect, useCallback } from "react";
import InputField from "./InputField";
import { useForm } from "react-hook-form";
import { useAddBookMutation } from "../../../redux/features/books/booksApi";
import { useGetCategoriesQuery } from "../../../redux/features/categories/categoriesApi";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "../../../utils/uploadService";
import axios from "axios";
import AsyncSelect from "react-select/async"; // Import AsyncSelect
import debounce from "lodash/debounce"; // Hoặc sử dụng hàm debounce tự định nghĩa

const AddBook = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [addBook, { isLoading }] = useAddBookMutation();
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const [coverImage, setCoverImage] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [tags, setTags] = useState(""); // State để lưu tags
  const [language, setLanguage] = useState("Tiếng Anh"); // State để lưu ngôn ngữ

  const categories = categoriesData?.map((category) => ({
    value: category._id,
    label: category.name,
  })) || [];

  const debouncedLoadOptions = debounce(async (inputValue) => {
    if (!inputValue) return [];

    try {
      const response = await axios.get(
        `${baseUrl}/authors/search?name=${inputValue}`
      );

      if (response.data && Array.isArray(response.data)) {
        return response.data.map((author) => ({
          value: author._id,
          label: author.name,
        }));
      }
      console.error("Invalid authors data format:", response.data);
      return [];
    } catch (error) {
      console.error("Error loading author options:", error);
      toast.error(error.response?.data?.message || "Failed to load authors");
      return [];
    }
  }, 300);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const url = await uploadToCloudinary(file);
      if (url) {
        setCoverImage(url);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Failed to upload image.");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("An error occurred while uploading the image.");
    }
  };

  const handleTagsChange = (event) => {
    setTags(event.target.value);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const onSubmit = async (data) => {
    const newBookData = {
      ...data,
      coverImage: coverImage,
      author: selectedAuthor ? selectedAuthor.value : null,
      category: data.category,
      publish: data.publish,
      tags: tags.split(",").map((tag) => tag.trim()), // Chuyển chuỗi tags thành mảng
      language: language,
      price: {
        oldPrice: parseFloat(data.oldPrice), // Đưa oldPrice vào đối tượng price
        newPrice: parseFloat(data.newPrice), // Đưa newPrice vào đối tượng price
      },
    };

    console.log("Data being sent to API:", newBookData); // Kiểm tra dữ liệu

    try {
      await addBook(newBookData).unwrap();
      Swal.fire({
        title: "Book added",
        text: "Your book is uploaded successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
      reset();
      setCoverImage("");
      setSelectedAuthor(null);
      setTags("");
      setLanguage("Tiếng Anh");
    } catch (error) {
      console.error("Error adding book:", error); // Log lỗi chi tiết
      alert("Failed to add book. Please try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto md:p-6 p-3 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Book</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField
          label="Title"
          name="title"
          placeholder="Enter book title"
          register={register}
        />

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Author
          </label>
          <AsyncSelect
            cacheOptions
            loadOptions={debouncedLoadOptions}
            defaultOptions
            onChange={setSelectedAuthor}
            value={selectedAuthor}
            placeholder="Select or search author"
            isClearable
          />
        </div>

        <InputField
          label="Description"
          name="description"
          placeholder="Enter book description"
          type="textarea"
          register={register}
        />
        <InputField
          label="Nhà xuất bản"
          name="publish"
          placeholder="Enter book description"
          type="textarea"
          register={register}
        />
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Category
          </label>
          <select
            {...register("category", { required: true })}
            className="form-select"
          >
            <option value="">Select a category</option>
            {categories.length > 0 ? (
              categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))
            ) : (
              <option disabled>Loading categories...</option>
            )}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">Category is required.</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={handleTagsChange}
            placeholder="Enter tags (comma-separated)"
            className="form-input"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Language
          </label>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="form-select"
          >
            <option value="Tiếng Anh">Tiếng Anh</option>
            <option value="Tiếng Việt">Tiếng Việt</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              {...register("trending")}
              className="rounded text-blue-600 focus:ring focus:ring-offset-2 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-semibold text-gray-700">
              Trending
            </span>
          </label>
        </div>

        <InputField
          label="Old Price"
          name="oldPrice"
          type="number"
          placeholder="Old Price"
          register={register}
        />

        <InputField
          label="New Price"
          name="newPrice"
          type="number"
          placeholder="New Price"
          register={register}
        />

        <InputField
          label="Quantity"
          name="quantity"
          type="number"
          placeholder="Quantity"
          register={register}
        />

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cover Image
          </label>
          <input
            type="file"
            onChange={handleImageUpload}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            accept="image/*"
          />
          {coverImage && (
            <div className="mt-2">
              <img
                src={coverImage}
                alt="Cover Preview"
                className="max-w-full h-40"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-green-500 text-white font-bold rounded-md"
        >
          {isLoading ? "Adding..." : "Add Book"}
        </button>
      </form>
    </div>
  );
};

export default AddBook;
