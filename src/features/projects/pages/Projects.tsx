import { useEffect, useState } from "react"
import { apiService } from "@/services/api"

export default function Projects() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.get('/posts/', { 
          skip: 0, 
          limit: 100, 
          status: 'draft' 
        })
        setPosts(data)
      } catch (e: any) {
        setError(e?.message || 'Failed to fetch posts')
        console.error('Error fetching posts:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Projects</h1>
      <p className="text-muted-foreground mt-2">List of posts (Draft status).</p>
      
      <div className="mt-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Found {posts.length} draft posts
          </p>
        </div>
        
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No draft posts found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg">{post.title}</h3>
                <p className="text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                  <span>Status: {post.status}</span>
                  <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}