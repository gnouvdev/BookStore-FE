import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseURL from "../../../utils/baseURL";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseURL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboardOverview: builder.query({
      query: () => "/admin/dashboard/overview",
      providesTags: ["Dashboard"],
    }),

    getMonthlySales: builder.query({
      query: () => "/admin/dashboard/monthly-sales",
      providesTags: ["Dashboard"],
    }),

    getRecentOrders: builder.query({
      query: () => "/admin/dashboard/recent-orders",
      providesTags: ["Dashboard"],
    }),

    getTopSellingBooks: builder.query({
      query: () => "/admin/dashboard/top-selling-books",
      providesTags: ["Dashboard"],
    }),

    getUsers: builder.query({
      query: () => "/admin/dashboard/users",
      providesTags: ["Dashboard"],
    }),

    exportReport: builder.mutation({
      query: ({ type, startDate, endDate }) => ({
        url: `/admin/dashboard/export/${type}`,
        method: "GET",
        params: { startDate, endDate },
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            `${type}-report-${new Date().toISOString().split("T")[0]}.xlsx`
          );
          document.body.appendChild(link);
          link.click();
          link.remove();
          return { data: "Report downloaded successfully" };
        },
      }),
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
  useGetMonthlySalesQuery,
  useGetRecentOrdersQuery,
  useGetTopSellingBooksQuery,
  useGetUsersQuery,
  useExportReportMutation,
} = dashboardApi;
