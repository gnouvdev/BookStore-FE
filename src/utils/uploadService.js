import toast from "react-hot-toast";

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "eBook_project");

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/ddzqupaez/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Failed to upload image");

    const data = await response.json();
    return data.secure_url; // URL ảnh sau khi tải lên
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    toast.error("Failed to upload image");
    return null;
  }
};