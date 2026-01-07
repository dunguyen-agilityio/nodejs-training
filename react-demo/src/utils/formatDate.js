/**
 * Format ISO 8601 date string to readable format
 * @param {string} isoDateString - ISO 8601 date string (e.g., "2025-12-18T10:00:00.000Z")
 * @param {string} format - Format type: 'short', 'medium', 'long', 'relative'
 * @returns {string} Formatted date string
 *
 * NOTE: The Blog API stores timestamps using SQLite's current_timestamp which uses local server time.
 * If you see incorrect "X hours ago" values, this is due to timezone mismatch between the API server
 * and client browser. The API should ideally use UTC timestamps (datetime('now') in SQLite).
 */
export const formatDate = (isoDateString, format = 'medium') => {
  if (!isoDateString) return '';

  const date = new Date(isoDateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  switch (format) {
    case 'short':
      // "12/18/2025"
      return date.toLocaleDateString();

    case 'medium':
      // "Dec 18, 2025"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

    case 'long':
      // "December 18, 2025 at 10:00 AM"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

    case 'relative':
      // "2 days ago", "just now", etc.
      return formatRelativeTime(date);

    default:
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
  }
};

/**
 * Format date as relative time (e.g., "2 hours ago", "just now")
 * @param {Date} date - Date object
 * @returns {string} Relative time string
 */
const formatRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

/**
 * Format time only (e.g., "10:30 AM")
 * @param {string} isoDateString - ISO 8601 date string
 * @returns {string} Formatted time string
 */
export const formatTime = (isoDateString) => {
  if (!isoDateString) return '';

  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) {
    return 'Invalid time';
  }

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default formatDate;
