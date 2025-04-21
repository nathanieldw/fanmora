import { User } from '@/types';

interface ProfileInfoCardProps {
  user: User;
}

export default function ProfileInfoCard({ user }: ProfileInfoCardProps) {
  return (
    <div className="ml-4 flex-1">
      <div className="flex flex-col mb-2">
        <h2 className="text-lg font-bold">{user.name}</h2>
        <div className="flex items-center">
          <span className="text-sm text-gray-500">@{user.username}</span>
        </div>
      </div>
      <div className="mt-1">
        <p className="text-sm">{user.bio || 'No bio available'}</p>
      </div>
    </div>
  );
}
