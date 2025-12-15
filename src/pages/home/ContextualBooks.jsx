import React from "react";
import { useGetContextualRecommendationsQuery } from "../../redux/features/recommendationv2/recommendationsv2Api";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Calendar, Gift, Sparkles } from "lucide-react";
import BookCard from "../books/BookCart";

const ContextualBooks = () => {
  const { t } = useTranslation();
  const { currentUser, loading: authLoading } = useAuth();
  
  // Check cả token để đảm bảo token đã được load
  const hasToken = !!localStorage.getItem("token");
  const shouldSkip = authLoading || !currentUser || !hasToken;
  
  const {
    data: response,
    error,
    isLoading,
  } = useGetContextualRecommendationsQuery(undefined, {
    skip: shouldSkip, // Chỉ gọi API khi có user đăng nhập và token
  });

  const books = response?.data || [];
  const context = response?.context;

  // Nếu không có ngày lễ hoặc không có sách, không hiển thị
  if (!isLoading && (!context || !books || books.length === 0)) {
    return null;
  }

  // Chỉ hiển thị tối đa 4 sách
  const displayBooks = books.slice(0, 4);

  // Tên ngày lễ để hiển thị - với i18n
  const getHolidayTitle = () => {
    if (!context)
      return t("contextualBooks.specialHoliday", "Ngày lễ đặc biệt");

    const holidayName =
      context.holidayName ||
      t("contextualBooks.specialHoliday", "Ngày lễ đặc biệt");

    // Nếu gần ngày lễ (isNearHoliday), thêm thông tin số ngày
    if (context.isNearHoliday && context.daysUntil !== undefined) {
      if (context.daysUntil === 0) {
        return t(
          "contextualBooks.todayHoliday",
          { holiday: holidayName },
          `Hôm nay: ${holidayName}`
        );
      } else if (context.daysUntil === 1) {
        return t(
          "contextualBooks.tomorrowHoliday",
          { holiday: holidayName },
          `Ngày mai: ${holidayName}`
        );
      } else {
        return t(
          "contextualBooks.upcomingHoliday",
          { days: context.daysUntil, holiday: holidayName },
          `Còn ${context.daysUntil} ngày đến ${holidayName}`
        );
      }
    }

    return holidayName;
  };

  const holidayTitle = getHolidayTitle();

  return (
    <section className="py-12 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header với icon và badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                {context && context.holidayName
                  ? context.holidayName
                  : t("contextualBooks.title", "Siêu ưu đãi mùa lễ!")}
              </h2>
              {context && (context.isHoliday || context.isNearHoliday) && (
                <p className="text-purple-600 font-semibold mt-1 flex items-center gap-2">
                  <span className="text-sm bg-purple-100 px-3 py-1 rounded-full">
                    {context.isHoliday
                      ? t("contextualBooks.today", "Hôm nay")
                      : context.daysUntil === 0
                      ? t("contextualBooks.today", "Hôm nay")
                      : context.daysUntil === 1
                      ? t("contextualBooks.tomorrow", "Ngày mai")
                      : context.daysUntil !== undefined
                      ? t(
                          "contextualBooks.daysUntil",
                          { days: context.daysUntil },
                          `Còn ${context.daysUntil} ngày`
                        )
                      : ""}
                  </span>
                </p>
              )}
            </div>
          </div>
          {context && (
            <p className="text-gray-600 text-sm max-w-2xl mx-auto">
              {t(
                "contextualBooks.description",
                { holiday: holidayTitle },
                `Khám phá những cuốn sách đặc biệt phù hợp với ${holidayTitle.toLowerCase()}`
              )}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
              >
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">
              {t("contextualBooks.error", "Không thể tải sách theo ngữ cảnh")}
            </p>
          </div>
        ) : displayBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {displayBooks.map((book, index) => (
              <div key={book._id} className="relative">
                {/* Holiday badge */}
                {index === 0 && context && (
                  <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {t("contextualBooks.special", "Đặc biệt")}
                    </div>
                  </div>
                )}
                <BookCard book={book} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default ContextualBooks;
