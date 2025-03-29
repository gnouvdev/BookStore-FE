import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import { Toaster } from 'react-hot-toast';
const initialState = {
    cartItems: []
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const existingItem = state.cartItems.find(item => item._id === action.payload._id);
            
            // Luôn thêm ít nhất 1 sản phẩm, không lấy quantity từ payload (vì đó là số lượng trong kho)
            const quantityToAdd = action.payload.quantityToAdd || 1;
        
            if (existingItem) {
                existingItem.quantity += quantityToAdd;
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Increased Quantity in Cart",
                    showConfirmButton: false,
                    timer: 1000
                });
            } else {
                state.cartItems.push({ ...action.payload, quantity: quantityToAdd });
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Product Added to Cart",
                    showConfirmButton: false,
                    timer: 1000
                });
            }
        },
        
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter(item => item._id !== action.payload);
        },
        increaseQuantity: (state, action) => {
            const existingItem = state.cartItems.find(item => item._id === action.payload);
            if (existingItem) {
                existingItem.quantity += 1;
            }
        },
        decreaseQuantity: (state, action) => {
            const existingItem = state.cartItems.find(item => item._id === action.payload);
            if (existingItem) {
                if (existingItem.quantity > 1) {
                    existingItem.quantity -= 1;
                } else {
                    state.cartItems = state.cartItems.filter(item => item._id !== action.payload);
                }
            }
        },
        clearCart: (state) => {
            state.cartItems = [];
        }
    }
});

// Export actions   
export const { addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
