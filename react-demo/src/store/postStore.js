import { create } from "zustand";
import api from "../services/api";

/**
 * Post Store using Zustand
 * Replaces the previous React Context API implementation
 *
 * State:
 * - posts: Array of post objects
 * - loading: Boolean indicating if an API call is in progress
 * - error: Error message string or null
 * - searchTerm: Current search term
 *
 * Actions:
 * - fetchPosts: Fetch all posts from API
 * - fetchPostById: Fetch single post by ID
 * - createPost: Create a new post
 * - updatePost: Update an existing post
 * - deletePost: Delete a post
 * - searchPosts: Search posts by term
 * - setSearchTerm: Update search term
 * - clearError: Clear error state
 */
const usePostStore = create((set, get) => ({
  // State
  posts: [],
  loading: false,
  error: null,
  searchTerm: "",
  firstLoaded: false,

  // Actions
  setSearchTerm: (term) => set({ searchTerm: term }),

  clearError: () => set({ error: null }),

  // Fetch all posts (GET /posts)
  fetchPosts: async () => {
    const firstLoaded = get().firstLoaded;
    set({
      loading: true,
      error: null,
      ...(!firstLoaded && { firstLoaded: true }),
    });
    try {
      const response = await api.get("/posts");
      // Handle wrapped response format: { meta: { total }, data: [] }
      set({
        posts: response.data.data || [],
        loading: false,
        searchTerm: "", // Clear search term when fetching all
      });
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch posts";
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  // Fetch single post by ID (GET /posts/:id)
  fetchPostById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/posts/${id}`);
      // Handle direct response format (no wrapper)
      set({ loading: false });
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data || err.message || "Failed to fetch post";
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  // Create new post (POST /posts)
  createPost: async (postData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/posts", postData);
      // Add new post to local state
      set((state) => ({
        posts: [...state.posts, response.data],
        loading: false,
      }));
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create post";
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  // Update post (PUT /posts/:id)
  updatePost: async (id, postData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/posts/${id}`, postData);
      // Update post in local state
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === id ? response.data : post
        ),
        loading: false,
      }));
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to update post";
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  // Delete post (DELETE /posts/:id)
  deletePost: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/posts/${id}`);
      // Remove post from local state
      set((state) => ({
        posts: state.posts.filter((post) => post.id !== id),
        loading: false,
      }));
      return true;
    } catch (err) {
      const errorMessage =
        err.response?.data || err.message || "Failed to delete post";
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  // Search posts (GET /posts?term=keyword)
  searchPosts: async (searchTerm) => {
    set({ loading: true, error: null, searchTerm });
    try {
      const response = await api.get("/posts", {
        params: { term: searchTerm },
      });
      // Handle wrapped response format: { meta: { total }, data: [] }
      set({
        posts: response.data.data || [],
        loading: false,
      });
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to search posts";
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },
}));

export default usePostStore;
