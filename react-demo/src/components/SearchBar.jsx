import { memo } from "react";
import { useState, useEffect } from "react";

/**
 * SearchBar Component
 * Controlled input component for search functionality
 * Only manages search term state with debouncing
 * Parent component (HomePage) handles the actual data fetching
 */
const SearchBar = ({ value, onChange, onClear }) => {
  const [localValue, setLocalValue] = useState(value || "");

  // Sync local value with prop value when it changes externally
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  // Debounced onChange handler
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChange?.(localValue);
    }, 500); // 400ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [localValue, value, onChange]);

  // Handle input change
  const handleInputChange = (e) => {
    setLocalValue(e.target.value);
  };

  // Handle clear button click
  const handleClearSearch = () => {
    setLocalValue("");
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="relative mb-6">
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          placeholder="Search posts by title, content, category, or tags..."
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Loading Spinner or Clear Button */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {localValue && (
            <button
              onClick={handleClearSearch}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search Info */}
      {value && (
        <p className="mt-2 text-sm text-gray-600">
          Searching for: <span className="font-medium">{value}</span>
        </p>
      )}
    </div>
  );
};

export default memo(SearchBar);
