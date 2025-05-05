import React, { useEffect, useState } from "react";
  import InputField from "../addBook/InputField";
  import AsyncSelect from "react-select/async";
  import { useForm } from "react-hook-form";
  import { useParams, useNavigate } from "react-router-dom";
  import {
    useFetchBookByIdQuery,
    useUpdateBookMutation,
  } from "../../../redux/features/books/booksApi";
  import Loading from "../../../components/Loading";
  import Swal from "sweetalert2";
  import { toast } from "react-hot-toast";
  import { uploadToCloudinary } from "../../../utils/uploadService";
  import debounce from "lodash/debounce";
  import SelectField from "../addBook/SelectField";
  import axios from "axios";
  import getBaseUrl from "../../../utils/baseURL";

  const UpdateBook = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
      data: bookData,
      isLoading,
      isError,
      error,
      refetch,
    } = useFetchBookByIdQuery(id);
    const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
    const [coverImage, setCoverImage] = useState("");
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState("");
    const [language, setLanguage] = useState("Tiếng Anh");
    const { register, handleSubmit, setValue, reset } = useForm();

    useEffect(() => {
      console.log("Book ID từ useParams:", id);
      console.log("Book data từ useFetchBookByIdQuery:", bookData);
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
          const response = await axios.get(`${getBaseUrl()}/api/categories`);
          setCategories(
            response.data.map((category) => ({
              value: category._id,
              label: category.name,
            }))
          );
        } catch (error) {
          console.error("Error fetching categories:", error);
          toast.error("Failed to load categories.");
        }
      };

      fetchCategories();
    }, []);

    const loadAuthorOptions = debounce(async (inputValue, callback) => {
      if (!inputValue) return callback([]);

      try {
        const response = await axios.get(
          `${getBaseUrl()}/api/authors/search?name=${inputValue}`
        );
        const authors = response.data.map((author) => ({
          value: author._id,
          label: author.name,
        }));
        callback(authors);
      } catch (error) {
        console.error("Error fetching authors:", error);
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
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in first.");
          navigate("/admin");
          return;
        }

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
        const errorMessage =
          error.data?.message || "Failed to update book. Please try again.";
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
            />
          </div>
          <InputField
            label="Description"
            name="description"
            placeholder="Enter book description"
            type="textarea"
            register={register}
          />
          <SelectField
            label="Category"
            name="category"
            options={[{ value: "", label: "Choose A Category" }, ...categories]}
            register={register}
          />
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
            {(coverImage || bookData?.coverImage) && (
              <div className="mt-2">
                <img
                  src={coverImage || bookData.coverImage}
                  alt="Cover Preview"
                  className="max-w-full h-40"
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isUpdating || !bookData}
            className="w-full py-2 bg-blue-500 text-white font-bold rounded-md disabled:bg-gray-400"
          >
            {isUpdating ? "Updating..." : "Update Book"}
          </button>
        </form>
      </div>
    );
  };

  export default UpdateBook;