import React, { useState, useEffect } from "react";
import InputField from "./InputField";
import { useForm } from "react-hook-form";
import { useAddBookMutation } from "../../../redux/features/books/booksApi";
import { useGetCategoriesQuery } from "../../../redux/features/categories/categoriesApi";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "../../../utils/uploadService";
import axios from "axios";
import AsyncSelect from "react-select/async";
import debounce from "lodash/debounce";
import baseUrl from "./../../../utils/baseURL";
import { useNavigate } from "react-router-dom";

const AddBook = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

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

  const [addBook, { isLoading }] = useAddBookMutation();
  const {
    data: categoriesData,
    isError: isCategoriesError,
    error: categoriesError,
  } = useGetCategoriesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [coverImage, setCoverImage] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("Tiếng Anh");

  // Handle authentication errors
  if (isCategoriesError) {
    if (categoriesError?.status === 401 || categoriesError?.status === 403) {
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
        Error: {categoriesError.data?.message || "Failed to load categories"}
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const categories =
    categoriesData?.map((category) => ({
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
      tags: tags.split(",").map((tag) => tag.trim()),
      language: language,
      price: {
        oldPrice: parseFloat(data.oldPrice),
        newPrice: parseFloat(data.newPrice),
      },
    };

    console.log("Data being sent to API:", newBookData);

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
      console.error("Error adding book:", error);
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
        toast.error(error.data?.message || "Failed to add book!");
      }
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
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Add Book"}
        </button>
      </form>
    </div>
  );
};

export default AddBook;
