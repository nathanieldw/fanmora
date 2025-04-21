import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileBannerProps {
  user: User;
}

export default function ProfileBanner({ user }: ProfileBannerProps) {
  return (
    <div className="relative">
      <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-500">
        {user.banner_image && (
          <img
            src={`/storage/${user.banner_image}`}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex p-4">
        <Avatar className="h-24 w-24 border-4 border-white -mt-12 z-10">
          <AvatarImage
            src={typeof user.profile_photo === 'string' ? `/storage/${user.profile_photo}` : undefined}
            alt={typeof user.name === 'string' ? user.name : ''}
          />
          <AvatarFallback>
            {typeof user.name === 'string' ? user.name.charAt(0).toUpperCase() : '?'}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
