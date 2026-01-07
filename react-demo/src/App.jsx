import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastProvider } from "./context/ToastContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";

// Pages will be created in Phase 3+
import HomePage from "./pages/HomePage";
import PostDetailPage from "./pages/PostDetailPage";
import CreatePostPage from "./pages/CreatePostPage";
import EditPostPage from "./pages/EditPostPage";

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * App Component
 * Main application component with routing and global providers
 * Now using React Query for data fetching and Zustand for UI state
 */
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
              <Routes>
                {/* Home page - list all posts */}
                <Route path="/" element={<HomePage />} />

                {/* Post detail page */}
                <Route path="/posts/:id" element={<PostDetailPage />} />

                {/* Create new post */}
                <Route path="/create" element={<CreatePostPage />} />

                {/* Edit existing post */}
                <Route path="/edit/:id" element={<EditPostPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
