import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

/**
 * Query Keys
 * Centralized query key management for React Query
 */
export const postKeys = {
  all: ["posts"],
  lists: () => [...postKeys.all, "list"],
  list: (filters) => [...postKeys.lists(), filters],
  details: () => [...postKeys.all, "detail"],
  detail: (id) => [...postKeys.details(), id],
};

/**
 * API Functions
 * These functions call the API and return the data
 */
const fetchPosts = async () => {
  const response = await api.get("/posts");
  return response.data.data; // Extract data array from { meta, data } wrapper
};

const fetchPostById = async (id) => {
  const response = await api.get(`/posts/${id}`);
  return response.data; // Single post object (no wrapper)
};

const searchPosts = async (searchTerm) => {
  const response = await api.get("/posts", {
    params: { term: searchTerm },
  });
  return response.data.data;
};

const fetchCategories = async () => {
  const response = await api.get("/categories");
  return response.data.data; // Extract data array from { meta, data } wrapper
};

const createPost = async (postData) => {
  const response = await api.post("/posts", postData);
  return response.data;
};

const updatePost = async ({ id, data }) => {
  const response = await api.put(`/posts/${id}`, data);
  return response.data;
};

const deletePost = async (id) => {
  await api.delete(`/posts/${id}`);
  return id;
};

/**
 * Custom Hooks
 */

/**
 * Fetch all posts
 */
export const usePosts = () => {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: fetchPosts,
  });
};

/**
 * Fetch posts with search term
 */
export const useSearchPosts = (searchTerm) => {
  return useQuery({
    queryKey: postKeys.list({ search: searchTerm }),
    queryFn: () => searchPosts(searchTerm),
    enabled: Boolean(searchTerm), // Only run when searchTerm exists
  });
};

/**
 * Fetch single post by ID
 */
export const usePost = (id, enabled = true) => {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => fetchPostById(id),
    enabled: Boolean(id) && enabled, // Only run when ID exists
  });
};

/**
 * Fetch all categories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30, // Categories rarely change, cache for 30 minutes
  });
};

/**
 * Create a new post
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      // Invalidate and refetch posts list
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });

      // Optionally add the new post to cache
      queryClient.setQueryData(postKeys.detail(newPost.id), newPost);
    },
  });
};

/**
 * Update an existing post
 */
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePost,
    onSuccess: (updatedPost) => {
      // Update the post detail in cache
      queryClient.setQueryData(postKeys.detail(updatedPost.id), updatedPost);

      // Invalidate posts list to refetch with updated data
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

/**
 * Delete a post
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: (deletedId) => {
      // Remove the post from cache
      queryClient.removeQueries({ queryKey: postKeys.detail(deletedId) });

      // Invalidate posts list to refetch without deleted post
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};
