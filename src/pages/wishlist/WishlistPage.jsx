import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import BookCard from "../books/BookCart";
import { useTranslation } from "react-i18next";
import { fetchWishlist } from "../../redux/features/wishlist/wishlistSlice";

const WishlistPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { wishlistItems, loading, error } = useSelector(
    (state) => state.wishlist
  );

  useEffect(() => {
    console.log("WishlistPage mounted, fetching wishlist...");
    dispatch(fetchWishlist());
  }, [dispatch]);

  useEffect(() => {
    console.log("Wishlist state updated:", { wishlistItems, loading, error });
  }, [wishlistItems, loading, error]);

  if (loading) {
    console.log("Wishlist is loading...");
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Wishlist error:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  console.log("Rendering wishlist items:", wishlistItems);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("wishlist.title")}</h1>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">{t("wishlist.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
