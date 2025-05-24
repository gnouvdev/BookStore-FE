import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Slider } from "@mui/material";

const Filter = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 1000000,
    language: "",
    author: "",
    sortBy: "",
    tags: [],
  });

  const [popularTags, setPopularTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for popular tags
    const mockTags = [
      { id: "bestseller", count: 150 },
      { id: "new", count: 120 },
      { id: "sale", count: 100 },
      { id: "fiction", count: 80 },
      { id: "non-fiction", count: 75 },
      { id: "educational", count: 60 },
      { id: "children", count: 45 },
      { id: "self-help", count: 30 },
    ];

    // Simulate API call
    setTimeout(() => {
      const sortedTags = mockTags
        .sort((a, b) => b.count - a.count)
        .map((tag) => ({
          ...tag,
          label: t(`filter.tags.${tag.id}`),
        }));

      setPopularTags(sortedTags);
      setIsLoading(false);
    }, 500);
  }, [t]);

  const handlePriceChange = (event, newValue) => {
    const [min, max] = newValue;
    const newFilters = { ...filters, minPrice: min, maxPrice: max };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTagClick = (tagId) => {
    console.log("Tag clicked:", tagId);
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter((id) => id !== tagId)
      : [...filters.tags, tagId];

    const newFilters = { ...filters, tags: newTags };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="w-64 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">{t("filter.title")}</h3>

      {/* Price Range Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("filter.priceRange")}
        </label>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatPrice(filters.minPrice)}</span>
            <span>{formatPrice(filters.maxPrice)}</span>
          </div>
          <div className="px-2">
            <Slider
              value={[filters.minPrice, filters.maxPrice]}
              onChange={handlePriceChange}
              min={0}
              max={1000000}
              step={10000}
              valueLabelDisplay="auto"
              valueLabelFormat={formatPrice}
              disableSwap
            />
          </div>
        </div>
      </div>

      {/* Language Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("filter.language")}
        </label>
        <select
          name="language"
          value={filters.language}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded-md"
        >
          <option value="">{t("filter.allLanguages")}</option>
          <option value="Vietnamese">{t("filter.vietnamese")}</option>
          <option value="English">{t("filter.english")}</option>
        </select>
      </div>

      {/* Author Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("filter.author")}
        </label>
        <select
          name="author"
          value={filters.author}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded-md"
        >
          <option value="">{t("filter.allAuthors")}</option>
          <option value="trending">{t("filter.trendingAuthors")}</option>
        </select>
      </div>

      {/* Sort By Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("filter.sortBy")}
        </label>
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded-md"
        >
          <option value="">{t("filter.default")}</option>
          <option value="price_asc">{t("filter.priceLowToHigh")}</option>
          <option value="price_desc">{t("filter.priceHighToLow")}</option>
          <option value="newest">{t("filter.newest")}</option>
          <option value="trending">{t("filter.trending")}</option>
        </select>
      </div>

      {/* Popular Tags */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("filter.popularTags")}
        </label>
        {isLoading ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-20 bg-gray-200 animate-pulse rounded-full"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.id)}
                className={`px-3 py-1 text-sm rounded-full transition-colors flex items-center gap-1 cursor-pointer
                  ${
                    filters.tags.includes(tag.id)
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {tag.label}
                <span className="text-xs opacity-75">({tag.count})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Filter;
