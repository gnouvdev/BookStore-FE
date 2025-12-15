import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL}/api`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Wrapper để xử lý 401 errors một cách graceful
const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  
  // Nếu lỗi 401 và không có token, không log error (user chưa login)
  if (result.error && result.error.status === 401) {
    const token = localStorage.getItem("token");
    if (!token) {
      // User chưa login, không cần log error
      return {
        ...result,
        error: {
          ...result.error,
          data: { message: "Please login to continue" },
        },
      };
    }
    // Token có nhưng hết hạn hoặc không hợp lệ
    // Có thể thêm logic refresh token ở đây nếu cần
  }
  
  return result;
};

export default baseQueryWithAuth;