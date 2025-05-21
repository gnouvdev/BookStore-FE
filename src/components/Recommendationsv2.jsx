import React from "react";
import { useGetCollaborativeRecommendationsQuery } from "../redux/features/recommendationv2/recommendationsv2Api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

import BookCard from './../pages/books/BookCart';

const Recommendationsv2 = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { data, error, isLoading } = useGetCollaborativeRecommendationsQuery(undefined, {
    skip: !currentUser,
  });

  if (!currentUser) return null;
  if (isLoading) return (
    <div className="container mx-auto p-6 text-center">
      <div className="animate-pulse text-gray-600 text-lg">{t("loading")}</div>
    </div>
  );
  if (error) return (
    <div className="container mx-auto p-6 text-red-600 text-center font-semibold">
      {t("error")}: {error.message}
    </div>
  );

  return (
    <section className="relative py-16">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200 opacity-20 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Tiêu đề */}
        <h2 className="text-5xl md:text-5xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700 drop-shadow-lg animate-slide-in py-2">
          {t("recommendations.for_you")}
        </h2>

        {/* Container chính với viền gradient và shadow */}
        <div className="relative bg-white rounded-2xl p-8 shadow-xl border-2 border-transparent bg-clip-border bg-gradient-to-r from-blue-300 to-purple-300 transition-transform hover:scale-[1.01] duration-300">
          {data?.data?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {data.data.map((book, index) => (
                <div
                  key={book._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <BookCard
                    book={{
                      _id: book._id,
                      title: book.title,
                      description: book.description,
                      coverImage: book.coverImage,
                      price: {
                        newPrice: book.price,
                        oldPrice: book.price * 1.2 // Giả định oldPrice cao hơn 20%
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-lg text-center py-8 animate-fade-in">
              {t("recommendations.no_recommendations")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Recommendationsv2;