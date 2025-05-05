import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { uploadToCloudinary } from "../../utils/uploadService";
import { toast } from "react-hot-toast";

const Profile = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      country: "",
      zip: "",
    },
    photo: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in first.");
        window.location.href = "/login";
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Profile data:", response.data);
        setProfile(response.data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (error.response && error.response.status === 403) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        } else {
          toast.error("Failed to load profile data.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile && Object.keys(profile).length > 0) {
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: {
          street: profile.address?.street || "",
          city: profile.address?.city || "",
          country: profile.address?.country || "",
          zip: profile.address?.zip || "",
        },
        photo: profile.photo || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let photoUrl = formData.photo;

      if (selectedFile) {
        photoUrl = await uploadToCloudinary(selectedFile);
        if (!photoUrl) {
          toast.error("Failed to upload image.");
          setIsLoading(false);
          return;
        }
      }

      console.log("Update profile payload:", { ...formData, photo: photoUrl });

      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        { ...formData, photo: photoUrl },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Update profile response:", response.data);

      setProfile(response.data.user);
      setFormData((prev) => ({
        ...prev,
        photo: response.data.user.photo,
      }));
      setCurrentUser(response.data.user);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update profile.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/2">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Street</label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">City</label>
            <input
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Country</label>
            <input
              type="text"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Zip</label>
            <input
              type="text"
              name="address.zip"
              value={formData.address.zip}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Profile Picture</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border rounded p-2"
              accept="image/*"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
      <div className="w-full md:w-1/2 flex flex-col items-center">
        <img
          src={profile.photo || "https://via.placeholder.com/100"}
          alt="User Avatar"
          className="w-24 h-24 rounded-full border-2 border-gray-300"
        />
        <h2 className="text-xl font-semibold mt-4">{profile.fullName || "N/A"}</h2>
        <p className="text-gray-600">{profile.email || "N/A"}</p>
      </div>
    </div>
  );
};

export default Profile;