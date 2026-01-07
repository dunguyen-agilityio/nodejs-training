import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { usePost, useDeletePost } from "../hooks/usePostsQuery";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../utils/usePageTitle";
import PostDetail from "../components/PostDetail";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmDialog from "../components/ConfirmDialog";

/**
 * PostDetailPage Component
 * Displays a single blog post with full details
 * Handles loading, error (404), navigation, and deletion
 * Now using React Query for data fetching
 */
const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: post, isLoading, error, refetch } = usePost(id, !isDeleting);
  const deletePostMutation = useDeletePost();
  const { showSuccess, showError } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const notFound = error?.response?.status === 404;
  usePageTitle(post ? post.title : "Post Details");

  // Handle delete button click
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    setIsDeleting(true); // Mark as deleting to prevent fetch refetch
    try {
      await deletePostMutation.mutateAsync(id);
      showSuccess("Post deleted successfully!");

      // Immediately navigate to homepage - no delay
      navigate("/");
    } catch (err) {
      setIsDeleting(false); // Reset if deletion fails
      // Handle errors
      let errorMsg;
      if (err.response?.status === 404) {
        errorMsg = "Post not found or already deleted.";
      } else if (err.response?.status === 500) {
        errorMsg = "Server error. Please try again later.";
      } else {
        errorMsg = err.message || "Failed to delete post. Please try again.";
      }
      showError(errorMsg);
      setShowDeleteDialog(false);
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container">
        <LoadingSpinner size="large" message="Loading post..." />
      </div>
    );
  }

  // 404 Not Found state (but don't show if we're in the middle of deleting)
  if (notFound && !isDeleting) {
    return (
      <div className="container">
        <div className="max-w-2xl mx-auto text-center py-12">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Post Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to All Posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <nav className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
        </nav>

        {/* Error State */}
        {error && !notFound && (
          <ErrorMessage
            message={error.message || "Failed to load post"}
            onRetry={refetch}
          />
        )}

        {/* Post Detail */}
        {post && !error && <PostDetail post={post} />}

        {/* Action Buttons */}
        {post && !error && (
          <div className="mt-6 flex gap-4">
            <Link
              to={`/edit/${post.id}`}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Post
            </Link>

            <button
              onClick={handleDeleteClick}
              disabled={deletePostMutation.isPending}
              className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete Post
            </button>
          </div>
        )}

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isLoading={deletePostMutation.isPending}
          variant="danger"
        />
      </div>
    </div>
  );
};

export default PostDetailPage;
