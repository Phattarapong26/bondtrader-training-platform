import React, { useMemo, useState } from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  profilePicture?: string;
}

const API_URL = 'http://localhost:3000';

const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', profilePicture }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  const getProfilePictureUrl = (filename: string) => {
    return `${API_URL}/uploads/${filename}`;
  };

  const avatarUrl = useMemo(() => {
    if (profilePicture && !imageError) {
      return getProfilePictureUrl(profilePicture);
    }
    const seed = encodeURIComponent(name);
    const style = 'avataaars';
    return `https://api.dicebear.com/6.x/${style}/svg?seed=${seed}`;
  }, [name, profilePicture, imageError]);
  const handleImageError = () => {
    console.error('Error loading profile picture:', profilePicture);
    setImageError(true);
  };

  return (
    <div id={`avatar-container-${name}`} className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200`}>
      <img
        id={`avatar-image-${name}`}
        src={avatarUrl}
        alt={name}
        className={`rounded-full object-cover ${sizeClasses[size]}`}
        onError={handleImageError}
      />
    </div>
  );
};

export default Avatar;