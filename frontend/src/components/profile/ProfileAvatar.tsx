import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { ProfileAvatarProps } from '@/types/profile-image';
import { cn } from '@/lib/utils';
import UploadInterface from './UploadInterface';
import ImagePreview from './ImagePreview';
import ImageCropper from './ImageCropper';

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  user,
  size = 'medium',
  editable = false,
  onImageUpdate,
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showUploadInterface, setShowUploadInterface] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCropper, setShowCropper] = useState(false);

  const sizeClasses = {
    small: 'h-12 w-12 text-lg',
    medium: 'h-24 w-24 text-3xl',
    large: 'h-32 w-32 text-4xl'
  };

  const cameraSizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-10 w-10'
  };

  const cameraIconSizes = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5'
  };

  const handleCameraClick = () => {
    if (editable && onImageUpdate) {
      setShowUploadInterface(true);
    }
  };

  const handleImageSelected = (file: File) => {
    setSelectedFile(file);
    setShowUploadInterface(false);
    setShowPreview(true);
  };

  const handlePreviewContinue = () => {
    setShowPreview(false);
    setShowCropper(true);
  };

  const handleCropComplete = (croppedImage: Blob) => {
    setShowCropper(false);
    
    // Create URL for the cropped image
    const croppedUrl = URL.createObjectURL(croppedImage);
    if (onImageUpdate) {
      onImageUpdate(croppedUrl);
    }
    
    // Reset states
    setSelectedFile(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setShowPreview(true);
  };

  const handlePreviewChooseDifferent = () => {
    setShowPreview(false);
    setSelectedFile(null);
    setShowUploadInterface(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div 
        className={cn('relative inline-block', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Avatar Circle */}
        <div className={cn(
          'flex items-center justify-center rounded-full font-display font-bold transition-all duration-200',
          sizeClasses[size],
          user.profileImage 
            ? 'bg-cover bg-center bg-no-repeat' 
            : 'bg-gradient-hero text-primary-foreground',
          isLoading && 'opacity-50'
        )}
        style={user.profileImage ? { backgroundImage: `url(${user.profileImage})` } : undefined}
        >
          {!user.profileImage && getInitials(user.name)}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className={cn(
            'absolute inset-0 flex items-center justify-center rounded-full bg-black/50',
            sizeClasses[size]
          )}>
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
          </div>
        )}

        {/* Camera Button */}
        {editable && (
          <button
            onClick={handleCameraClick}
            className={cn(
              'absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              cameraSizeClasses[size],
              isHovered ? 'scale-110' : 'scale-100'
            )}
            disabled={isLoading}
            aria-label="Change profile picture"
          >
            <Camera className={cameraIconSizes[size]} />
          </button>
        )}
      </div>

      {/* Upload Interface Modal */}
      <UploadInterface
        isOpen={showUploadInterface}
        onClose={() => setShowUploadInterface(false)}
        onImageSelected={handleImageSelected}
        currentImageUrl={user.profileImage}
      />

      {/* Image Preview Modal */}
      {selectedFile && showPreview && (
        <ImagePreview
          file={selectedFile}
          onContinue={handlePreviewContinue}
          onChooseDifferent={handlePreviewChooseDifferent}
          maxFileSize={5}
        />
      )}

      {/* Image Cropper Modal */}
      {selectedFile && showCropper && (
        <ImageCropper
          image={selectedFile}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          cropShape="round"
          showRotationControls={true}
          showZoomControls={true}
        />
      )}
    </>
  );
};

export default ProfileAvatar;