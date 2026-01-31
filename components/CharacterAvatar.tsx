import { CharacterWithAccessories, BaseBody, Accessory, UserAccessory } from "@shared/schema";

interface CharacterAvatarProps {
  characterData: CharacterWithAccessories | null;
  size?: number;
  className?: string;
  showPlaceholder?: boolean;
}

interface PlaceholderAvatarProps {
  gender?: 'male' | 'female';
  size: number;
}

function PlaceholderAvatar({ gender, size }: PlaceholderAvatarProps) {
  const bgColor = gender === 'female' ? 'bg-pink-200 dark:bg-pink-900' : 'bg-blue-200 dark:bg-blue-900';
  const iconColor = gender === 'female' ? 'text-pink-500' : 'text-blue-500';
  
  return (
    <div 
      className={`${bgColor} rounded-full flex items-center justify-center`}
      style={{ width: size, height: size }}
      data-testid="character-avatar-placeholder"
    >
      <svg
        className={iconColor}
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M12 14c-6 0-8 3-8 6v2h16v-2c0-3-2-6-8-6z" />
      </svg>
    </div>
  );
}

export function CharacterAvatar({ 
  characterData, 
  size = 120, 
  className = "",
  showPlaceholder = true 
}: CharacterAvatarProps) {
  if (!characterData) {
    if (showPlaceholder) {
      return <PlaceholderAvatar size={size} />;
    }
    return null;
  }

  // characterData is CharacterWithAccessories which includes Character properties and equippedAccessories
  const equippedAccessories = characterData.equippedAccessories;
  // baseBody is not part of CharacterWithAccessories in current schema
  // For now, we'll set it to null and handle the case in the JSX
  const baseBody: { imageUrl: string } | null = null;
  // Get character properties directly from characterData
  const gender = characterData.gender;
  
  const sortedAccessories = [...equippedAccessories]
    .filter(ua => ua.imageUrl) // Filter items that have an image URL
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)); // Use sortOrder instead of zIndex

  // Editor uses 300x400 canvas. For square avatar containers with object-contain,
  // the 4:3 aspect ratio image is limited by height, creating horizontal letterbox.
  // Scale by height: size/400, horizontal offset: (size - 300*scaleRatio)/2
  const scaleRatio = size / 400;
  const scaledWidth = 300 * scaleRatio;
  const offsetX = (size - scaledWidth) / 2;
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      data-testid="character-avatar"
    >
      <PlaceholderAvatar
        gender={gender as 'male' | 'female'}
        size={size}
      />
      
      {sortedAccessories.map((accessory) => {
        // In current schema, accessory properties are directly on the object
        // positionX, positionY, scale, zIndex are not available in current schema
        // For now, we'll skip positioning and scaling

        return (
          <img
            key={accessory.id}
            src={accessory.imageUrl}
            alt={accessory.name}
            className="absolute object-contain"
            style={{
              zIndex: accessory.sortOrder, // Using sortOrder as zIndex approximation
              left: 0, // Positioning not available in current schema
              top: 0,
              width: '100%',
              height: '100%',
            }}
            data-testid={`character-accessory-${accessory.id}`}
          />
        );
      })}
    </div>
  );
}

interface CharacterAvatarPreviewProps {
  baseBody: BaseBody | null;
  accessories: Accessory[];
  size?: number;
  className?: string;
}

export function CharacterAvatarPreview({
  baseBody,
  accessories,
  size = 120,
  className = "",
}: CharacterAvatarPreviewProps) {
  const sortedAccessories = [...accessories].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  
  // Editor uses 300x400 canvas. For square avatar containers with object-contain,
  // the 4:3 aspect ratio image is limited by height, creating horizontal letterbox.
  const scaleRatio = size / 400;
  const scaledWidth = 300 * scaleRatio;
  const offsetX = (size - scaledWidth) / 2;

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      data-testid="character-avatar-preview"
    >
      {baseBody && (
        <img
          src={baseBody.imageUrl}
          alt="Базовое тело"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ zIndex: 0 }}
          data-testid="preview-base-body"
        />
      )}
      
      {sortedAccessories.map((accessory) => {
        // In current schema, positionX, positionY, scale, zIndex are not available
        // For now, we'll use default positioning and sizing

        return (
          <img
            key={accessory.id}
            src={accessory.imageUrl}
            alt={accessory.name}
            className="absolute object-contain"
            style={{
              zIndex: accessory.sortOrder || 0, // Using sortOrder as zIndex approximation
              left: 0, // Positioning not available in current schema
              top: 0,
              width: '100%',
              height: '100%',
            }}
            data-testid={`preview-accessory-${accessory.id}`}
          />
        );
      })}
    </div>
  );
}
