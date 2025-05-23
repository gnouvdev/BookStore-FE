import React from "react";
import { useTranslation } from "react-i18next";
import { FaHistory, FaTrash } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const SearchHistory = ({ history, onSelect, onDelete }) => {
  const { t } = useTranslation();

  if (!history || history.length === 0) {
    return (
      <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md mt-1 p-4 z-50">
        <p className="text-gray-500 text-center">{t("search.no_history")}</p>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md mt-1 z-50">
      <div className="p-2 border-b flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <FaHistory className="text-gray-500" />
          {t("search.recent_searches")}
        </h3>
        <span className="text-xs text-gray-400">
          {t("search.click_to_search")}
        </span>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer group"
          >
            <div
              className="flex-1 flex items-center gap-2"
              onClick={() => onSelect(item.query)}
            >
              <FaHistory className="text-gray-400 text-sm" />
              <span className="text-sm text-gray-700">{item.query}</span>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(item.timestamp), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item._id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
              title={t("search.delete_history")}
            >
              <FaTrash className="text-gray-400 text-sm hover:text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory;
