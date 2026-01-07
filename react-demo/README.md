# React Demo Application for Blog API

A React-based demo application that provides a user-friendly interface for the Blog API (Feature 003-blog-api-sqlite). Built with React 19, Vite 6, Tailwind CSS 4, and React Hook Form 7.

## Features

- 📝 Browse and view blog posts
- ✏️ Create new blog posts
- 🔄 Edit existing posts
- 🗑️ Delete posts
- 🔍 Search posts by keyword
- 📱 Responsive design (mobile to desktop)
- ⚡ Fast development with Vite HMR
- 🎨 Styled with Tailwind CSS

## Prerequisites

Before running this application, ensure you have:

- **Node.js 20.x** or higher installed
- **npm 10.x** or higher
- **Blog API** running at `http://localhost:3001`
  - Located at: `blogging-platform-api/blogging-platform-api`
  - Start with: `cd ../blogging-platform-api && npm start`

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

The `.env.local` file is already configured with default values:

```env
VITE_API_URL=http://localhost:3001
VITE_API_TIMEOUT=5000
```

If your Blog API runs on a different port, update `VITE_API_URL` in `.env.local`.

### 3. Start the Blog API

**Important**: The Blog API must be running before starting the React app.

```bash
# In a separate terminal
cd ../blogging-platform-api
npm start
```

Verify the API is running by visiting: http://localhost:3001/posts

### 4. Start the Development Server

```bash
npm run dev
```

The application will start at: http://localhost:5173

## Project Structure

```
react-demo/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components for routing
│   ├── store/          # Zustand state management
│   ├── context/        # React Context (ToastContext only)
│   ├── services/       # API integration layer
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Root component with Router
│   └── index.css       # Tailwind CSS imports
├── .env.local          # Environment variables (not committed)
└── vite.config.js      # Vite configuration
```

## Troubleshooting

### CORS Errors

If you see CORS errors:
- Verify Blog API has CORS enabled for http://localhost:5173
- Or use the Vite proxy (already configured in vite.config.js)

### API Not Found

- Verify Blog API is running: http://localhost:3001/posts
- Check `VITE_API_URL` in `.env.local`

## Technology Stack

- **React 19** - Latest React features
- **Vite 6** - Fast build tool
- **Tailwind CSS 4** - Utility-first CSS
- **React Router 7** - Client routing
- **React Hook Form 7** - Form management
- **Zustand** - State management
- **Axios** - HTTP client

## Usage Guide

### Creating a New Post

1. Click the **"Create New Post"** button on the homepage
2. Fill in all required fields:
   - **Title**: Post title (3-200 characters)
   - **Content**: Post content (minimum 10 characters)
   - **Category**: Post category (2-50 characters)
   - **Tags**: Comma-separated tags (e.g., "react, vite, tutorial")
3. Click **"Create Post"** to publish
4. You'll be redirected to the homepage after successful creation

### Viewing Post Details

- Click on any post card on the homepage to view full details
- Post detail page shows:
  - Full title and content
  - Category and tags
  - Creation and update timestamps
  - Edit and Delete action buttons

### Editing a Post

1. Navigate to a post detail page
2. Click the **"Edit Post"** button
3. Modify the form fields
4. Click **"Update Post"** to save changes

### Deleting a Post

1. Navigate to a post detail page
2. Click the **"Delete Post"** button
3. Confirm deletion in the dialog
4. Post will be permanently removed

### Searching Posts

1. Use the search bar at the top of the homepage
2. Enter keywords to search by title, content, category, or tags
3. Results update automatically as you type (with debouncing)
4. Click the **X** button to clear search and show all posts

## Troubleshooting

### CORS Errors

**Problem**: Browser console shows CORS policy errors when making API requests.

**Solutions**:

1. **Verify API is running**: Ensure the Blog API server is started and accessible at the configured URL
   ```bash
   curl http://localhost:8080/posts
   ```

2. **Check environment variables**: Verify `.env.local` has the correct API URL
   ```env
   VITE_API_URL=http://localhost:8080
   ```

3. **Restart dev server**: After changing `.env.local`, restart the Vite dev server
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

4. **Check proxy configuration**: Vite proxy is configured in `vite.config.js` for `/api` routes (if needed)

### API Connection Refused

**Problem**: "Failed to fetch" or "Network Error" when loading posts.

**Solutions**:

1. **Verify API is running**:
   ```bash
   # Check if API is listening on port 8080
   curl http://localhost:8080/posts
   ```

2. **Check API logs**: Look for errors in the Blog API terminal

3. **Verify database**: Ensure the SQLite database exists and has data
   ```bash
   cd ../blogging-platform-api
   ls -la data/blog.db
   ```

4. **Check firewall**: Ensure firewall isn't blocking localhost connections

### No Posts Displayed

**Problem**: Homepage shows "No posts yet" even though API has data.

**Solutions**:

1. **Check API response**: Open browser DevTools → Network tab → Check `/posts` response

2. **Verify response format**: API should return:
   ```json
   {
     "meta": { "total": 10 },
     "data": [...]
   }
   ```

3. **Check console for errors**: Open browser console (F12) for error messages

4. **Clear browser cache**: Hard refresh with Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### Tailwind CSS Styles Not Working

**Problem**: Application looks unstyled or CSS classes aren't applied.

**Solutions**:

1. **Verify Tailwind installation**:
   ```bash
   npm list tailwindcss @tailwindcss/postcss
   ```

2. **Check `src/index.css`**: Should contain:
   ```css
   @import "tailwindcss";
   ```

3. **Verify PostCSS config**: Check `postcss.config.js` has:
   ```javascript
   export default {
     plugins: {
       '@tailwindcss/postcss': {},
       autoprefixer: {},
     },
   }
   ```

4. **Restart dev server**: Tailwind requires server restart after config changes

### Form Validation Errors

**Problem**: Form shows validation errors even with correct input.

**Solutions**:

1. **Check field requirements**:
   - Title: 3-200 characters
   - Content: Minimum 10 characters
   - Category: 2-50 characters
   - Tags: At least one tag required

2. **Tags format**: Use comma-separated values
   ```
   Correct: "react, vite, tutorial"
   Wrong: "#react #vite #tutorial"
   ```

3. **Clear browser cache**: Old validation rules might be cached

### Port Already in Use

**Problem**: `Port 5173 is in use, trying another one...`

**Solutions**:

1. **Kill process using the port**:
   ```bash
   # Windows
   netstat -ano | findstr :5173
   taskkill /PID <PID> /F

   # Mac/Linux
   lsof -ti:5173 | xargs kill -9
   ```

2. **Use different port**: Vite will automatically try 5174, 5175, etc.

3. **Specify port manually** in `vite.config.js`:
   ```javascript
   server: {
     port: 3000,
   }
   ```

### Search Not Working

**Problem**: Search returns no results or doesn't trigger.

**Solutions**:

1. **Check API endpoint**: Verify API supports `GET /posts?term=keyword`
   ```bash
   curl "http://localhost:8080/posts?term=test"
   ```

2. **Wait for debounce**: Search has 400ms delay - type and wait briefly

3. **Check search term**: Must be non-empty string

4. **Clear search**: Click the X button to reset and show all posts

## Development Tips

- **Hot Module Replacement (HMR)**: Changes auto-reload without full refresh
- **React DevTools**: Install browser extension for component debugging
- **Network Tab**: Monitor API calls in browser DevTools
- **Console Logging**: API requests/responses are logged to console
- **Error Boundary**: Application catches and displays React errors gracefully

## API Compatibility

This React app is designed to work with the Blog API (Feature 003) with the following endpoints:

- `GET /posts` - List all posts (with optional `?term=keyword` for search)
- `GET /posts/:id` - Get single post
- `POST /posts` - Create new post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

Response formats:
- **List endpoints**: `{ meta: { total }, data: [] }`
- **Single item endpoints**: Direct object or empty (204)
- **Validation errors**: `400` with error message
