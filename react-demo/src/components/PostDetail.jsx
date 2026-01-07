import { formatDate } from '../utils/formatDate';

/**
 * PostDetail Component
 * Displays full blog post content with all metadata
 * Used on the PostDetailPage
 */
const PostDetail = ({ post }) => {
  if (!post) return null;

  return (
    <article className="bg-white rounded-lg shadow-md p-6 md:p-8">
      {/* Post Header */}
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        {/* Metadata Bar */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 pb-6 border-b border-gray-200">
          {/* Category */}
          {post.category && (
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span className="font-medium text-blue-600">{post.category}</span>
            </div>
          )}

          {/* Created Date */}
          {post.createdAt && (
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                Published {formatDate(post.createdAt, 'long')}
              </span>
            </div>
          )}

          {/* Updated Date (if different from created) */}
          {post.updatedAt && post.updatedAt !== post.createdAt && (
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="text-gray-500">
                Updated {formatDate(post.updatedAt, 'relative')}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Post Content */}
      <div className="prose prose-lg max-w-none mb-8">
        <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </div>

      {/* Tags Section */}
      {post.tags && post.tags.length > 0 && (
        <footer className="pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">Tags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
};

export default PostDetail;
