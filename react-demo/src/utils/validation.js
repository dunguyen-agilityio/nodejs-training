/**
 * Form Validation Rules
 * Validation rules for React Hook Form
 */

/**
 * Post form validation rules
 * All fields are required for creating/editing posts
 */
export const postValidationRules = {
  title: {
    required: 'Title is required',
    minLength: {
      value: 3,
      message: 'Title must be at least 3 characters long',
    },
    maxLength: {
      value: 200,
      message: 'Title must not exceed 200 characters',
    },
  },
  content: {
    required: 'Content is required',
    minLength: {
      value: 10,
      message: 'Content must be at least 10 characters long',
    },
  },
  category: {
    required: 'Category is required',
    minLength: {
      value: 2,
      message: 'Category must be at least 2 characters long',
    },
    maxLength: {
      value: 50,
      message: 'Category must not exceed 50 characters',
    },
  },
  tags: {
    required: 'At least one tag is required',
    validate: {
      notEmpty: (value) => {
        if (typeof value === 'string') {
          return value.trim().length > 0 || 'At least one tag is required';
        }
        if (Array.isArray(value)) {
          return value.length > 0 || 'At least one tag is required';
        }
        return 'Invalid tags format';
      },
    },
  },
};

/**
 * Parse comma-separated tags into an array
 * @param {string} tagsString - Comma-separated tags
 * @returns {string[]} Array of trimmed, non-empty tags
 */
export const parseTagsString = (tagsString) => {
  if (!tagsString || typeof tagsString !== 'string') {
    return [];
  }

  return tagsString
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
};

/**
 * Convert tags array to comma-separated string
 * @param {string[]} tagsArray - Array of tags
 * @returns {string} Comma-separated tags string
 */
export const formatTagsArray = (tagsArray) => {
  if (!Array.isArray(tagsArray)) {
    return '';
  }

  return tagsArray.join(', ');
};

/**
 * Validate post data before submission
 * @param {Object} postData - Post data object
 * @returns {Object} Validation result { valid: boolean, errors: Object }
 */
export const validatePostData = (postData) => {
  const errors = {};

  // Title validation
  if (!postData.title || postData.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (postData.title.length < 3) {
    errors.title = 'Title must be at least 3 characters long';
  } else if (postData.title.length > 200) {
    errors.title = 'Title must not exceed 200 characters';
  }

  // Content validation
  if (!postData.content || postData.content.trim().length === 0) {
    errors.content = 'Content is required';
  } else if (postData.content.length < 10) {
    errors.content = 'Content must be at least 10 characters long';
  }

  // Category validation
  if (!postData.category || postData.category.trim().length === 0) {
    errors.category = 'Category is required';
  } else if (postData.category.length < 2) {
    errors.category = 'Category must be at least 2 characters long';
  } else if (postData.category.length > 50) {
    errors.category = 'Category must not exceed 50 characters';
  }

  // Tags validation
  if (!postData.tags || (Array.isArray(postData.tags) && postData.tags.length === 0)) {
    errors.tags = 'At least one tag is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  postValidationRules,
  parseTagsString,
  formatTagsArray,
  validatePostData,
};
