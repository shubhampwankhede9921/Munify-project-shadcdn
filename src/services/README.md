# Simple API Service

A clean, minimal API service for making HTTP requests directly in components.

## Structure

```
src/services/
├── api.ts          # Simple API service with base configuration
└── README.md       # This documentation
```

## Usage

### 1. Direct API Calls in Components

```typescript
import { apiService } from '@/services/api'

// In your component
const fetchPosts = async () => {
  try {
    const data = await apiService.get('/posts/', { 
      skip: 0, 
      limit: 10, 
      status: 'draft' 
    })
    setPosts(data)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### 2. Your Curl Example

```typescript
// Your curl: curl -X 'GET' 'http://localhost:8000/api/v1/posts/?skip=0&limit=100&status=draft' -H 'accept: application/json'

// Direct usage in component:
const data = await apiService.get('/posts/', { 
  skip: 0, 
  limit: 100, 
  status: 'draft' 
})
```

### 3. All HTTP Methods

```typescript
// GET request
const data = await apiService.get('/posts/', { skip: 0, limit: 10 })

// POST request
const newPost = await apiService.post('/posts/', { title: 'New Post' })

// PUT request
const updatedPost = await apiService.put('/posts/1/', { title: 'Updated' })

// PATCH request
const patchedPost = await apiService.patch('/posts/1/', { status: 'published' })

// DELETE request
await apiService.delete('/posts/1/')
```

## Configuration

Set your API base URL in environment variables:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Features

- ✅ **Direct usage** - Call API directly in components where needed
- ✅ **Centralized base URL** - One place to configure your API endpoint
- ✅ **Automatic headers** - Content-Type and Accept headers included
- ✅ **TypeScript support** - Full type safety
- ✅ **Simple and clean** - No complex wrappers or hooks
- ✅ **Flexible** - Works with any endpoint and parameters

## Example Component Usage

```typescript
import { useEffect, useState } from "react"
import { apiService } from "@/services/api"

export default function PostsList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const data = await apiService.get('/posts/', { 
          skip: 0, 
          limit: 10, 
          status: 'draft' 
        })
        setPosts(data)
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}
```

This approach is simple, direct, and easy to understand - perfect for most applications!
