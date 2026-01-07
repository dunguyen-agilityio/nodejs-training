import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCategories } from "../hooks/usePostsQuery";
import {
  postValidationRules,
  parseTagsString,
  formatTagsArray,
} from "../utils/validation";

/**
 * PostForm Component
 * Reusable form for creating and editing blog posts
 * Uses React Hook Form for validation and state management
 * Now with category dropdown fetched from API
 */
const PostForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  submitButtonText = "Create Post",
  isSubmitting = false,
}) => {
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: initialData
      ? {
          title: initialData.title || "",
          content: initialData.content || "",
          category: initialData.category || "",
          tags: formatTagsArray(initialData.tags) || "",
        }
      : {
          title: "",
          content: "",
          category: "",
          tags: "",
        },
  });

  // Update form values when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || "",
        content: initialData.content || "",
        category: initialData.category || "",
        tags: formatTagsArray(initialData.tags) || "",
      });
    }
  }, [initialData, reset]);

  // Handle form submission
  const onSubmitHandler = async (data) => {
    // Convert comma-separated tags string to array
    const postData = {
      ...data,
      tags: parseTagsString(data.tags),
    };

    await onSubmit(postData);
  };

  // Handle form reset
  const handleReset = () => {
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      {/* Title Field */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Title *
        </label>
        <input
          type="text"
          id="title"
          {...register("title", postValidationRules.title)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter post title"
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Content Field */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Content *
        </label>
        <textarea
          id="content"
          rows={8}
          {...register("content", postValidationRules.content)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y ${
            errors.content ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Write your post content here..."
          disabled={isSubmitting}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      {/* Category Field */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Category *
        </label>
        <select
          id="category"
          {...register("category", postValidationRules.category)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.category ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isSubmitting || categoriesLoading}
        >
          <option value="">
            {categoriesLoading ? "Loading categories..." : "Select a category"}
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        {categoriesLoading && (
          <p className="mt-1 text-sm text-gray-500">
            Loading categories from API...
          </p>
        )}
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      {/* Tags Field */}
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Tags *
        </label>
        <input
          type="text"
          id="tags"
          {...register("tags", postValidationRules.tags)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.tags ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="e.g., react, javascript, tutorial (comma-separated)"
          disabled={isSubmitting}
        />
        <p className="mt-1 text-sm text-gray-500">
          Separate multiple tags with commas
        </p>
        {errors.tags && (
          <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            submitButtonText
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}

        {!initialData && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Required Fields Notice */}
      <p className="text-sm text-gray-500 text-center">
        * All fields are required
      </p>
    </form>
  );
};

export default PostForm;
