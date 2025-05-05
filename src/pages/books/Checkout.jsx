import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { useCreateOrderMutation } from "../../redux/features/orders/ordersApi";

const CheckoutPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Chuyển hướng nếu chưa đăng nhập
  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const cartItems = useSelector((state) => state.cart.cartItems);

  // Tính tổng giá trị đơn hàng
  const totalPrice = cartItems
    .reduce((acc, item) => acc + item.newPrice * item.quantity, 0)
    .toFixed(2);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [isChecked, setIsChecked] = useState(false);

  const onSubmit = async (data) => {
    const newOrder = {
      name: data.name,
      email: currentUser?.email,
      address: {
        city: data.city,
        country: data.country,
        state: data.state,
        zipcode: data.zipcode,
      },
      phone: data.phone,
      products: cartItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      })),
      totalPrice: parseFloat(totalPrice),
    };

    try {
      await createOrder(newOrder).unwrap();
      Swal.fire({
        title: "Order Confirmed",
        text: "Your order has been placed successfully!",
        icon: "success",
      });
      navigate("/orders/thanks");
    } catch (error) {
      console.error("Error placing order", error);
      alert("Failed to place the order");
    }
  };

  if (isLoading) return <div>Loading....</div>;
  return (
    <section className="min-h-screen p-6 bg-gray-100 flex items-center justify-center">
      <div className="container max-w-screen-lg mx-auto">
        <div>
          <h2 className="font-semibold text-xl text-gray-600 mb-2">Checkout</h2>
          <p className="text-gray-500 mb-2">Total Price: ${totalPrice}</p>
          <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
            <h2 className="font-semibold text-xl text-gray-600 mb-4">Sản phẩm</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 border-b pb-4 last:border-b-0"
                >
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{item.title}</h3>
                    <p className="text-gray-500">Số lượng: {item.quantity}</p>
                    <p className="text-gray-600 font-semibold">
                      Giá: ${item.newPrice} x {item.quantity} = $
                      {(item.newPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
                      {...register("name", { required: true })}
                      type="text"
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label>Email</label>
                    <input
                      type="text"
                      disabled
                      defaultValue={currentUser?.email}
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label>Phone</label>
                    <input
                      {...register("phone", { required: true })}
                      type="number"
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label>Address</label>
                    <input
                      {...register("address", { required: true })}
                      type="text"
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label>City</label>
                    <input
                      {...register("city", { required: true })}
                      type="text"
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label>Country</label>
                    <input
                      {...register("country", { required: true })}
                      type="text"
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label>State</label>
                    <input
                      {...register("state", { required: true })}
                      type="text"
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label>Zipcode</label>
                    <input
                      {...register("zipcode", { required: true })}
                      type="text"
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                    />
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
                      disabled={!isChecked}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Place an Order
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
