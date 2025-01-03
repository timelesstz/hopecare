import { useState, useEffect } from 'react';

interface Post {
  id: number;
  title: string;
  content: string;
  status: 'published' | 'draft' | 'archived';
  category: string;
  author: string;
  date: string;
  featured: boolean;
  tags: string[];
}

const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // In a real application, this would be an API call
        // For now, we'll use mock data that matches our CMS structure
        const mockPosts: Post[] = [
          {
            id: 1,
            title: "Making a Difference in Our Community",
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            status: "published",
            category: "Impact Stories",
            author: "John Doe",
            date: "2024-03-15",
            featured: true,
            tags: ["community", "impact", "volunteering"]
          },
          {
            id: 2,
            title: "Volunteer Spotlight: Sarah's Story",
            content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            status: "published",
            category: "Volunteer Stories",
            author: "Jane Smith",
            date: "2024-03-14",
            featured: false,
            tags: ["volunteers", "stories"]
          },
          {
            id: 3,
            title: "Upcoming Community Events",
            content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            status: "published",
            category: "Events",
            author: "Mike Johnson",
            date: "2024-03-13",
            featured: false,
            tags: ["events", "community"]
          }
        ];

        setPosts(mockPosts.filter(post => post.status === 'published'));
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return { posts, isLoading, error };
};

export default usePosts;