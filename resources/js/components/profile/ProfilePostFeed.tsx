import { User } from '@/types';
import PostCard from '@/components/PostCard';

interface Post {
  id: number;
  [key: string]: any;
}

interface ProfilePostFeedProps {
  posts: Post[];
  user: User;
}

export default function ProfilePostFeed({ posts, user }: ProfilePostFeedProps) {
  if (!posts.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No posts available</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={{ ...post, user }} />
      ))}
    </div>
  );
}
