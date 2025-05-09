import { createSlice } from '@reduxjs/toolkit';

const items = localStorage.getItem('cartItems') !== null ? JSON.parse(localStorage.getItem('cartItems')) : [];

const totalAmount = localStorage.getItem('totalAmount') !== null ? JSON.parse(localStorage.getItem('totalAmount')) : 0;

const totalQuantity = localStorage.getItem('totalQuantity') !== null ? JSON.parse(localStorage.getItem('totalQuantity')) : 0;

const setItemFunc = (item, totalAmount, totalQuantity) => {
  localStorage.setItem('cartItems', JSON.stringify(item));
  localStorage.setItem('totalAmount', JSON.stringify(totalAmount));
  localStorage.setItem('totalQuantity', JSON.stringify(totalQuantity));
};

const initialState = {
  cartItems: items,
  totalQuantity: totalQuantity,
  totalAmount: totalAmount
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Thêm sản phẩm vào giỏ hàng
    addItem: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.cartItems.find(item => item._id === newItem._id);
      state.totalQuantity++;

      if (!existingItem) {
        state.cartItems.push({
          _id: newItem._id,
          title: newItem.title,
          coverImage: newItem.coverImage,
          newPrice: newItem.newPrice,
          quantity: 1,
          totalPrice: newItem.newPrice
        });
      } else {
        existingItem.quantity++;
        existingItem.totalPrice = Number(existingItem.totalPrice) + Number(newItem.newPrice);
      }

      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + Number(item.newPrice) * Number(item.quantity), 0
      );

      setItemFunc(
        state.cartItems.map(item => item),
        state.totalAmount,
        state.totalQuantity
      );
    },

    // Xóa sản phẩm khỏi giỏ hàng
    removeItem: (state, action) => {
      const id = action.payload;
      const existingItem = state.cartItems.find(item => item._id === id);
      state.totalQuantity--;

      if (existingItem.quantity === 1) {
        state.cartItems = state.cartItems.filter(item => item._id !== id);
      } else {
        existingItem.quantity--;
        existingItem.totalPrice = Number(existingItem.totalPrice) - Number(existingItem.newPrice);
      }

      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + Number(item.newPrice) * Number(item.quantity), 0
      );

      setItemFunc(
        state.cartItems.map(item => item),
        state.totalAmount,
        state.totalQuantity
      );
    },

    // Xóa toàn bộ giỏ hàng
    clearCart: (state) => {
      state.cartItems = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;

      localStorage.removeItem('cartItems');
      localStorage.removeItem('totalAmount');
      localStorage.removeItem('totalQuantity');
    },

    // Cập nhật số lượng sản phẩm
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find(item => item._id === id);
      
      if (item) {
        const diff = quantity - item.quantity;
        item.quantity = quantity;
        item.totalPrice = Number(item.newPrice) * quantity;
        state.totalQuantity += diff;

        state.totalAmount = state.cartItems.reduce(
          (total, item) => total + Number(item.newPrice) * Number(item.quantity), 0
        );

        setItemFunc(
          state.cartItems.map(item => item),
          state.totalAmount,
          state.totalQuantity
        );
      }
    }
  }
});

export const { addItem, removeItem, clearCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;