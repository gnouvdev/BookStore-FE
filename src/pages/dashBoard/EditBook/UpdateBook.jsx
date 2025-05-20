import React, { useEffect, useState } from "react";
import InputField from "../addBook/InputField";
import AsyncSelect from "react-select/async";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetBookByIdQuery,
  useUpdateBookMutation,
} from "../../../redux/features/books/booksApi";
import Loading from "../../../components/Loading";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";
import { uploadToCloudinary } from "../../../utils/uploadService";
import debounce from "lodash/debounce";
import SelectField from "../addBook/SelectField";
import axios from "axios";
import baseUrl from "../../../utils/baseURL";

const UpdateBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: bookData,
    isLoading,
    isError,
    error,
    // refetch,
  } = useGetBookByIdQuery(id);
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
  const [coverImage, setCoverImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("Tiếng Anh");
  const { register, handleSubmit, setValue, reset } = useForm();

  useEffect(() => {
    console.log("Book ID từ useParams:", id);
    console.log("Book data từ useGetBookByIdQuery:", bookData);
    if (!id) {
      console.error("Book ID is missing in the URL");
      toast.error("Invalid book ID. Please try again.");
      navigate("/dashboard/manage-books");
    }
    if (isError) {
      console.error("Error fetching book:", error);
      const errorMessage = error?.data?.message || "Failed to load book data.";
      toast.error(errorMessage);
      navigate("/dashboard/manage-books");
    }
  }, [id, bookData, isError, error, navigate]);

  useEffect(() => {
    if (bookData) {
      setValue("title", bookData.title);
      setValue("author", bookData.author?._id || bookData.author);
      setValue("description", bookData.description);
      setValue("category", bookData.category?._id || bookData.category);
      setValue("trending", bookData.trending);
      setValue("oldPrice", bookData.price?.oldPrice);
      setValue("newPrice", bookData.price?.newPrice);
      setValue("quantity", bookData.quantity);
      setValue("coverImage", bookData.coverImage);
      setTags(bookData.tags?.join(", ") || "");
      setLanguage(bookData.language || "Tiếng Anh");
      setCoverImage(bookData.coverImage || "");
    }
  }, [bookData, setValue]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${baseUrl}/categories`);
        console.log("Categories response:", response.data);
        if (response.data && Array.isArray(response.data)) {
          setCategories(
            response.data.map((category) => ({
              value: category._id,
              label: category.name,
            }))
          );
        } else {
          console.error("Invalid categories data format:", response.data);
          toast.error("Failed to load categories: Invalid data format");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error(error.response?.data?.message || "Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const loadAuthorOptions = debounce(async (inputValue, callback) => {
    if (!inputValue) return callback([]);

    try {
      const response = await axios.get(
        `${baseUrl}/authors/search?name=${inputValue}`
      );
      if (response.data && Array.isArray(response.data)) {
        const authors = response.data.map((author) => ({
          value: author._id,
          label: author.name,
        }));
        callback(authors);
      } else {
        console.error("Invalid authors data format:", response.data);
        callback([]);
      }
    } catch (error) {
      console.error("Error fetching authors:", error);
      toast.error(error.response?.data?.message || "Failed to load authors");
      callback([]);
    }
  }, 300);

  const handleTagsChange = (event) => {
    setTags(event.target.value);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const url = await uploadToCloudinary(file);
      if (url) {
        setCoverImage(url);
        setValue("coverImage", url);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Failed to upload image.");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("An error occurred while uploading the image.");
    }
  };

  const onSubmit = async (data) => {
    if (!bookData || !bookData._id) {
      toast.error("Book data is missing. Cannot update.");
      return;
    }

    const updatedBookData = {
      title: data.title,
      author: data.author,
      description: data.description,
      category: data.category,
      trending: data.trending,
      quantity: parseInt(data.quantity),
      coverImage: coverImage || bookData.coverImage,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
      language: language,
      price: {
        oldPrice: parseFloat(data.oldPrice),
        newPrice: parseFloat(data.newPrice),
      },
    };

    try {
      const response = await updateBook({ id: bookData._id, ...updatedBookData }).unwrap();
      console.log("Update response:", response);
      Swal.fire({
        title: "Book Updated",
        text: "Your book details have been updated successfully!",
        icon: "success",
      });
      reset();
      navigate("/dashboard/manage-books");
    } catch (error) {
      console.error("Update failed:", error);
      const errorMessage = error.data?.message || "Failed to update book. Please try again.";
      
      if (error.status === 404) {
        toast.error("Book not found. Please check the book ID.");
      } else if (error.status === 403) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/admin");
      } else if (error.status === 400) {
        toast.error("Invalid data provided. Please check your inputs.");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  if (isLoading) return <Loading />;
  if (isError) return <div>Error fetching book data</div>;

  return (
    <div className="max-w-lg mx-auto md:p-6 p-3 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Update Book</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField
          label="Title"
          name="title"
          placeholder="Enter book title"
          register={register}
        />
        <InputField
          label="Description"
          name="description"
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
            className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="">Choose A Category</option>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))
            ) : (
              <option disabled>Loading categories...</option>
            )}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Author
          </label>
          <AsyncSelect
            cacheOptions
            defaultOptions
            loadOptions={loadAuthorOptions}
            onChange={(selectedOption) =>
              setValue("author", selectedOption ? selectedOption.value : "")
            }
            defaultValue={
              bookData?.author
                ? { value: bookData.author._id, label: bookData.author.name }
                : null
            }
            placeholder="Search or select an author"
            className="w-full"
          />
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
            className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Language
          </label>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="Tiếng Anh">Tiếng Anh</option>
            <option value="Tiếng Việt">Tiếng Việt</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">
            Cover Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="form-input"
          />
          {coverImage && (
            <img
              src={coverImage}
              alt="Cover preview"
              className="mt-2 w-32 h-32 object-cover rounded"
            />
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Old Price"
            name="oldPrice"
            type="number"
            placeholder="Enter old price"
            register={register}
          />
          <InputField
            label="New Price"
            name="newPrice"
            type="number"
            placeholder="Enter new price"
            register={register}
          />
        </div>
        <InputField
          label="Quantity"
          name="quantity"
          type="number"
          placeholder="Enter quantity"
          register={register}
        />
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="trending"
            {...register("trending")}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <label htmlFor="trending" className="ml-2 text-sm text-gray-700">
            Trending Book
          </label>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard/manage-books")}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Update Book"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateBook;