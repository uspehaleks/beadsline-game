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

  const { character, baseBody, equippedAccessories } = characterData;
  
  const sortedAccessories = [...equippedAccessories]
    .filter(ua => ua.accessory)
    .sort((a, b) => (a.accessory?.zIndex || 0) - (b.accessory?.zIndex || 0));

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
      {baseBody && (
        <img
          src={baseBody.imageUrl}
          alt="Базовое тело"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ zIndex: 0 }}
          data-testid="character-base-body"
        />
      )}
      
      {!baseBody && (
        <PlaceholderAvatar 
          gender={character.gender as 'male' | 'female'} 
          size={size} 
        />
      )}
      
      {sortedAccessories.map((userAccessory) => {
        const accessory = userAccessory.accessory;
        if (!accessory) return null;
        
        // Scale positions from 300x400 canvas to fit in square container with letterbox offset
        const posX = accessory.positionX * scaleRatio + offsetX;
        const posY = accessory.positionY * scaleRatio;
        const accScale = parseFloat(String(accessory.scale || '1'));
        // Accessory images in editor are 80px base size * scale
        const imgSize = 80 * accScale * scaleRatio;
        
        return (
          <img
            key={userAccessory.id}
            src={accessory.imageUrl}
            alt={accessory.nameRu}
            className="absolute object-contain"
            style={{
              zIndex: accessory.zIndex,
              left: posX,
              top: posY,
              width: imgSize,
              height: imgSize,
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
  const sortedAccessories = [...accessories].sort((a, b) => a.zIndex - b.zIndex);
  
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
        // Scale positions from 300x400 canvas to fit in square container with letterbox offset
        const posX = accessory.positionX * scaleRatio + offsetX;
        const posY = accessory.positionY * scaleRatio;
        const accScale = parseFloat(String(accessory.scale || '1'));
        // Accessory images in editor are 80px base size * scale
        const imgSize = 80 * accScale * scaleRatio;
        
        return (
          <img
            key={accessory.id}
            src={accessory.imageUrl}
            alt={accessory.nameRu}
            className="absolute object-contain"
            style={{
              zIndex: accessory.zIndex,
              left: posX,
              top: posY,
              width: imgSize,
              height: imgSize,
            }}
            data-testid={`preview-accessory-${accessory.id}`}
          />
        );
      })}
    </div>
  );
}
