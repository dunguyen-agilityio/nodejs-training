import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';

/**
 * PostCard Component
 * Displays a summary of a blog post in card format
 * Used in the post list on the HomePage
 */
const PostCard = ({ post }) => {
  if (!post) return null;

  return (
    <Link to={`/posts/${post.id}`} className="block">
      <article className="card hover:shadow-lg transition-shadow">
        {/* Post Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate-2-lines">
          {post.title}
        </h3>

        {/* Post Content Preview */}
        {post.content && (
          <p className="text-gray-600 text-sm mb-4 truncate-3-lines">
            {post.content}
          </p>
        )}

        {/* Post Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {/* Category */}
          {post.category && (
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
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
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
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
              <span>{formatDate(post.createdAt, 'relative')}</span>
            </div>
          )}
        </div>

        {/* Tags Preview */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs font-medium text-gray-500">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </article>
    </Link>
  );
};

export default PostCard;
