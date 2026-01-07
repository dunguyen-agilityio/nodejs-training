import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePost, useUpdatePost } from "../hooks/usePostsQuery";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../utils/usePageTitle";
import PostForm from "../components/PostForm";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

/**
 * EditPostPage Component
 * Page for editing existing blog posts
 * Handles fetching post data, form submission, success/error states, and redirects
 * Now using React Query for data fetching
 */
const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: post, isLoading, error, refetch } = usePost(id);
  const updatePostMutation = useUpdatePost();
  const { showSuccess, showError } = useToast();
  const [submitError, setSubmitError] = useState(null);

  const notFound = error?.response?.status === 404;
  usePageTitle(post ? `Edit: ${post.title}` : "Edit Post");

  // Handle form submission
  const handleSubmit = async (postData) => {
    setSubmitError(null);

    try {
      await updatePostMutation.mutateAsync({ id, data: postData });

      // Show success toast
      showSuccess("Post updated successfully!");
      await refetch();

      // Redirect to post detail page after 1.5 seconds
      setTimeout(() => {
        navigate(`/posts/${id}`);
      }, 1500);
    } catch (err) {
      // Handle validation errors (400) from API
      if (err.response?.status === 400) {
        const apiError = err.response.data;
        if (typeof apiError === "object" && apiError.message) {
          setSubmitError(apiError.message);
          showError(apiError.message);
        } else if (typeof apiError === "string") {
          setSubmitError(apiError);
          showError(apiError);
        } else {
          const msg = "Validation failed. Please check your input.";
          setSubmitError(msg);
          showError(msg);
        }
      } else if (err.response?.status === 404) {
        // Handle 404 - post was deleted
        const msg = "Post not found. It may have been deleted.";
        setSubmitError(msg);
        showError(msg);
      } else {
        // Handle other errors
        const msg = err.message || "Failed to update post. Please try again.";
        setSubmitError(msg);
        showError(msg);
      }
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate(`/posts/${id}`);
  };

  // Loading state while fetching post
  if (isLoading) {
    return (
      <div className="container">
        <LoadingSpinner size="large" message="Loading post..." />
      </div>
    );
  }

  // 404 Not Found state
  if (notFound) {
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
            The post you're trying to edit doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
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
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <header className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
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

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Edit Post
          </h1>
          <p className="mt-2 text-gray-600">Update your blog post</p>
        </header>

        {/* Error Message */}
        {(error || submitError) && !notFound && (
          <ErrorMessage
            message={submitError || error?.message || "Failed to load post"}
            onRetry={() => setSubmitError(null)}
          />
        )}

        {/* Post Form */}
        {post && (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <PostForm
              initialData={post}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitButtonText="Update Post"
              isSubmitting={updatePostMutation.isPending}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPostPage;
