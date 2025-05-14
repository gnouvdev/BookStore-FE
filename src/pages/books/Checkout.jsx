import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { useCreateOrderMutation } from "../../redux/features/orders/ordersApi";
import { clearCart } from "../../redux/features/cart/cartSlice";
import {
  useGetPaymentMethodsQuery,
  useCreateVNPayUrlMutation,
} from "../../redux/features/payments/paymentsApi";
import { useGetCurrentUserQuery } from "../../redux/features/users/userApi";
import baseUrl from "../../utils/baseURL";

const CheckoutPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [isChecked, setIsChecked] = useState(false);
  const {
    data: paymentMethodsData,
    isLoading: isLoadingPayments,
    error: paymentError,
  } = useGetPaymentMethodsQuery();
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = useGetCurrentUserQuery();
  const paymentMethods = paymentMethodsData?.data || [];
  const [createVNPayUrl] = useCreateVNPayUrlMutation();

  console.log("Payment methods error:", paymentError);
  console.log("User data error:", userError);
  console.log("Cart items:", cartItems);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: currentUser?.displayName || "",
      email: currentUser?.email || "",
      city: currentUser?.address?.city || "",
      country: currentUser?.address?.country || "",
      state: currentUser?.address?.state || "",
      zipcode: currentUser?.address?.zipcode || "",
      phone: currentUser?.phone || "",
    },
  });

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const totalPrice = cartItems.reduce((acc, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    return acc + price * quantity;
  }, 0);

  const handlePaymentMethodSelect = (method) => {
    setSelectedPayment(method);
  };

  const validateStock = async () => {
    for (const item of cartItems) {
      try {
        const bookId = item._id || item.bookId;
        console.log(`Fetching book: ${baseUrl}/books/${bookId}`);
        console.log(`Using token: ${localStorage.getItem("token")}`);
        const response = await fetch(`${baseUrl}/books/${bookId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log(`Response status: ${response.status}`);
        if (!response.ok) {
          const text = await response.text();
          console.error(`Error response for book ${bookId}:`, text);
          throw new Error(
            `Failed to fetch book: ${response.status} ${response.statusText}`
          );
        }
        const book = await response.json();
        console.log(`Book data:`, book);
        const bookData = book.data || book;
        if (!bookData || typeof bookData.quantity === "undefined") {
          throw new Error(`Invalid book data for ${bookId}: Missing quantity`);
        }
        if (bookData.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${bookData.title || bookId}`);
        }
      } catch (error) {
        console.error(
          `Stock validation failed for ${item._id || item.bookId}:`,
          error
        );
        throw new Error(`Stock validation failed: ${error.message}`);
      }
    }
    return true;
  };

  const onSubmit = async (data) => {
    if (!cartItems.length) {
      Swal.fire({
        title: "Error",
        text: "Your cart is empty!",
        icon: "error",
      });
      return;
    }

    if (!selectedPayment) {
      Swal.fire({
        title: "Error",
        text: "Please select a payment method!",
        icon: "error",
      });
      return;
    }

    if (!userData?.data?._id) {
      Swal.fire({
        title: "Error",
        text: "User data not loaded. Please try again.",
        icon: "error",
      });
      return;
    }

    try {
      console.log("Validating stock...");
      await validateStock();

      const orderItems = cartItems.map((item) => ({
        productId: item._id || item.bookId,
        quantity: item.quantity || 1,
      }));

      console.log("Order items:", orderItems);
      console.log("User data:", userData.data);
      console.log("Shipping info:", {
        name: data.name,
        email: currentUser?.email,
        phone: data.phone,
        address: {
          city: data.city,
          country: data.country,
          state: data.state,
          zipcode: data.zipcode,
        },
      });

      if (selectedPayment.code === "VNPAY") {
        try {
          console.log("Creating VNPay payment URL...");
          const vnpayData = {
            orderItems,
            user: userData.data,
            shippingInfo: {
              name: data.name,
              email: currentUser?.email,
              phone: data.phone,
              address: {
                city: data.city,
                country: data.country || "",
                state: data.state || "",
                zipcode: data.zipcode || "",
              },
            },
            paymentMethodId: selectedPayment._id,
          };
          console.log("VNPay data:", vnpayData);
          const response = await createVNPayUrl(vnpayData).unwrap();
          console.log("VNPay response:", response);
          if (response.paymentUrl) {
            console.log("Redirecting to VNPay:", response.paymentUrl);
            window.location.href = response.paymentUrl;
          } else {
            throw new Error("No payment URL received from VNPay");
          }
        } catch (error) {
          console.error("VNPay Error:", error);
          Swal.fire({
            title: "Payment Error",
            text: error.data?.message || "Failed to create VNPay payment. Please try again.",
            icon: "error",
          });
        }
      } else if (selectedPayment.code === "COD") {
        const orderData = {
          user: userData.data._id,
          name: data.name,
          email: currentUser?.email,
          address: {
            city: data.city,
            country: data.country || "",
            state: data.state || "",
            zipcode: data.zipcode || "",
          },
          phone: data.phone || "",
          productIds: orderItems,
          totalPrice: totalPrice,
          paymentMethod: selectedPayment._id,
          status: "pending",
          paymentStatus: "pending",
          paymentDetails: {
            paymentAmount: totalPrice,
            paymentCurrency: "VND",
          },
        };

        console.log("Calling createOrder for COD...");
        const order = await createOrder(orderData).unwrap();
        console.log("Order created:", order);
        dispatch(clearCart());
        Swal.fire({
          title: "Order Confirmed",
          text: "Your order has been placed successfully!",
          icon: "success",
        });
        navigate("/orders/thanks");
      } else {
        throw new Error("Unsupported payment method");
      }
    } catch (error) {
      console.error("API Error:", {
        message: error.message,
        status: error.status,
        data: error.data,
        response: error.response?.data,
      });
      let errorMessage = "Failed to process the order";
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.status === "FETCH_ERROR") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
      });
    }
  };

  if (isLoading || isLoadingPayments || isLoadingUser)
    return <div className="container mx-auto p-6">Loading...</div>;

  const supportedMethods = paymentMethods.filter(
    (method) => method.isActive && ["COD", "VNPAY"].includes(method.code)
  );

  return (
    <section className="min-h-screen p-6 bg-gray-100 flex items-center justify-center">
      <div className="container max-w-screen-lg mx-auto">
        <h2 className="font-semibold text-xl text-gray-600 mb-2">Checkout</h2>
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded w-full shadow-lg p-4 px-4 md:p-8 mb-6">
            <h2 className="font-semibold text-xl text-gray-600 mb-4">Products</h2>
            <div className="space-y-4">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div
                    key={item._id || item.bookId}
                    className="flex items-center gap-4 border-b pb-4 last:border-b-0"
                  >
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{item.title}</h3>
                      <p className="text-gray-500">Quantity: {item.quantity}</p>
                      <p className="text-gray-600 font-semibold">
                        Price: {(item.price || 0).toLocaleString("vi-VN")} x{" "}
                        {item.quantity} ={" "}
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p>Your cart is empty.</p>
              )}
            </div>
            <p className="mt-4 text-right font-semibold">
              Total Price: {totalPrice.toLocaleString("vi-VN")}đ
            </p>
          </div>
          <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3"
            >
              <div className="text-gray-600">
                <p className="font-medium text-lg">Personal Details</p>
                <p>Please fill out all the fields.</p>
              </div>
              <div className="lg:col-span-2">
                <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                  <div className="md:col-span-5">
                    <label>Full Name</label>
                    <input
                      {...register("name", {
                        required: "Full Name is required",
                      })}
                      type="text"
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-xs">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-5">
                    <label>Email</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser?.email}
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label>Phone</label>
                    <input
                      {...register("phone", {
                        required: "Phone is required",
                        pattern: {
                          value: /^\+?\d{10,15}$/,
                          message: "Invalid phone number",
                        },
                      })}
                      type="text"
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-xs">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-3">
                    <label>City</label>
                    <input
                      {...register("city", { required: "City is required" })}
                      type="text"
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                    {errors.city && (
                      <p className="text-red-600 text-xs">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label>Country</label>
                    <input
                      {...register("country")}
                      type="text"
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label>State</label>
                    <input
                      {...register("state")}
                      type="text"
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label>Zipcode</label>
                    <input
                      {...register("zipcode")}
                      type="text"
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="block mb-2">Payment Method</label>
                    {isLoadingPayments ? (
                      <div>Loading payment methods...</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {supportedMethods.map((method) => (
                          <label
                            key={method._id}
                            className={`flex items-center gap-2 border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedPayment?._id === method._id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method._id}
                              checked={selectedPayment?._id === method._id}
                              onChange={() => handlePaymentMethodSelect(method)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div className="flex items-center gap-3">
                              <img
                                src={method.icon}
                                alt={method.name}
                                className="w-8 h-8 object-contain"
                              />
                              <div>
                                <h3 className="text-sm font-medium">
                                  {method.name}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {method.description}
                                </p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-5 mt-3">
                    <input
                      onChange={(e) => setIsChecked(e.target.checked)}
                      type="checkbox"
                      className="form-checkbox"
                    />
                    <label className="ml-2">
                      I agree to the{" "}
                      <Link className="underline text-blue-600">
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link className="underline text-blue-600">
                        Shopping Policy
                      </Link>
                      .
                    </label>
                  </div>
                  <div className="md:col-span-5 text-right">
                    <button
                      disabled={!isChecked || isLoading || !selectedPayment}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                      {isLoading ? "Placing Order..." : "Place an Order"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;