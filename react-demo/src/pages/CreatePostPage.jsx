import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePost } from '../hooks/usePostsQuery';
import { useToast } from '../context/ToastContext';
import { usePageTitle } from '../utils/usePageTitle';
import PostForm from '../components/PostForm';
import ErrorMessage from '../components/ErrorMessage';

/**
 * CreatePostPage Component
 * Page for creating new blog posts
 * Handles form submission, success/error states, and redirects
 * Now using React Query for mutations
 */
const CreatePostPage = () => {
  const navigate = useNavigate();
  const createPostMutation = useCreatePost();
  const { showSuccess, showError } = useToast();
  const [error, setError] = useState(null);

  usePageTitle('Create New Post');

  // Handle form submission
  const handleSubmit = async (postData) => {
    setError(null);

    try {
      await createPostMutation.mutateAsync(postData);

      // Show success toast
      showSuccess('Post created successfully!');

      // Redirect to homepage after 1.5 seconds
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      // Handle validation errors (400) from API
      if (err.response?.status === 400) {
        const apiError = err.response.data;
        if (typeof apiError === 'object' && apiError.message) {
          setError(apiError.message);
          showError(apiError.message);
        } else if (typeof apiError === 'string') {
          setError(apiError);
          showError(apiError);
        } else {
          const msg = 'Validation failed. Please check your input.';
          setError(msg);
          showError(msg);
        }
      } else {
        // Handle other errors
        const msg = err.message || 'Failed to create post. Please try again.';
        setError(msg);
        showError(msg);
      }
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate('/');
  };

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
            Create New Post
          </h1>
          <p className="mt-2 text-gray-600">
            Share your thoughts with the world
          </p>
        </header>

        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => setError(null)}
          />
        )}

        {/* Post Form */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <PostForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitButtonText="Create Post"
            isSubmitting={createPostMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
