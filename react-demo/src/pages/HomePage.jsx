import { useState } from "react";
import { Link } from "react-router-dom";
import { usePosts, useSearchPosts } from "../hooks/usePostsQuery";
import { usePageTitle } from "../utils/usePageTitle";
import PostList from "../components/PostList";
import SearchBar from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { useMemo } from "react";
import { useCallback } from "react";

/**
 * HomePage Component
 * Displays a list of all blog posts with search functionality
 * Handles loading, error, and empty states
 * Now using React Query for data fetching with search support
 */
const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all posts when no search term
  const {
    data: allPosts = [],
    isLoading: isLoadingAll,
    error: errorAll,
    refetch: refetchAll,
  } = usePosts();

  // Fetch filtered posts when search term exists
  const {
    data: searchResults = [],
    isLoading: isSearching,
    error: searchError,
  } = useSearchPosts(searchTerm);

  usePageTitle("Home");

  // Determine which data to use based on search state
  const posts = searchTerm ? searchResults : allPosts;
  const isLoading = searchTerm ? isSearching : isLoadingAll;
  const error = searchTerm ? searchError : errorAll;

  // Handle search term change from SearchBar
  const handleSearchChange = useCallback((newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  }, []);

  // Handle search clear
  const handleSearchClear = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Handle retry for error state
  const handleRetry = () => {
    if (searchTerm) {
      // For search errors, just retry by re-triggering the query
      // React Query will automatically refetch
    } else {
      refetchAll();
    }
  };

  return (
    <div className="container">
      {/* Page Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Blog Posts
            </h1>
            <p className="mt-2 text-gray-600">
              Explore our latest articles and stories
            </p>
          </div>

          {/* Create Post Button */}
          <Link
            to="/create"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white! font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Post
          </Link>
        </div>
      </header>

      {/* Search Bar */}
      <SearchBar
        value={useMemo(() => searchTerm, [])}
        onChange={handleSearchChange}
        onClear={handleSearchClear}
      />

      {/* Error State */}
      {error && (
        <ErrorMessage
          message={error.message || "Failed to load posts"}
          onRetry={handleRetry}
        />
      )}

      {/* Loading State */}
      {isLoading && <LoadingSpinner size="large" message="Loading posts..." />}

      {/* Search Results Info */}
      {!isLoading && !error && searchTerm && (
        <div className="mb-4 text-sm text-gray-600">
          {posts.length > 0 ? (
            <p>
              Found <span className="font-semibold">{posts.length}</span> post
              {posts.length !== 1 ? "s" : ""} for "{searchTerm}"
            </p>
          ) : (
            <p className="text-gray-500">
              No posts found for "{searchTerm}". Try a different search term.
            </p>
          )}
        </div>
      )}

      {/* Post List or Empty State */}
      {!error && !isLoading && <PostList posts={posts} />}

      {/* Post Count */}
      {!isLoading && !error && posts.length > 0 && !searchTerm && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {posts.length} post{posts.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default HomePage;
