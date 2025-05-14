import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Slider } from '@mui/material';

const Filter = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 1000000,
    language: '',
    author: '',
    sortBy: ''
  });

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="w-64 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">{t('filter.title')}</h3>
      
      {/* Price Range Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('filter.priceRange')}
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
          {t('filter.language')}
        </label>
        <select
          name="language"
          value={filters.language}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded-md"
        >
          <option value="">{t('filter.allLanguages')}</option>
          <option value="Vietnamese">{t('filter.vietnamese')}</option>
          <option value="English">{t('filter.english')}</option>
        </select>
      </div>

      {/* Author Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('filter.author')}
        </label>
        <select
          name="author"
          value={filters.author}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded-md"
        >
          <option value="">{t('filter.allAuthors')}</option>
          <option value="trending">{t('filter.trendingAuthors')}</option>
        </select>
      </div>

      {/* Sort By Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('filter.sortBy')}
        </label>
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded-md"
        >
          <option value="">{t('filter.default')}</option>
          <option value="price_asc">{t('filter.priceLowToHigh')}</option>
          <option value="price_desc">{t('filter.priceHighToLow')}</option>
          <option value="newest">{t('filter.newest')}</option>
          <option value="trending">{t('filter.trending')}</option>
        </select>
      </div>
    </div>
  );
};

export default Filter; 