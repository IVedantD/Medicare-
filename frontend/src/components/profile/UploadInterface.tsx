import React from 'react';
import { Camera, Image, FolderOpen, X, Trash2 } from 'lucide-react';
import { UploadInterfaceProps } from '@/types/profile-image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const UploadInterface: React.FC<UploadInterfaceProps> = ({
  isOpen,
  onClose,
  onImageSelected,
  currentImageUrl,
  maxFileSize = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}) => {
  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, source: string) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!acceptedFormats.includes(file.type)) {
        alert(`Please select a valid image file. Supported formats: ${acceptedFormats.join(', ')}`);
        return;
      }

      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSize) {
        alert(`File size must be less than ${maxFileSize}MB. Current size: ${fileSizeMB.toFixed(2)}MB`);
        return;
      }

      onImageSelected(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleCameraCapture = () => {
    // Create a file input for camera capture
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'user'; // Front camera for selfies
    input.onchange = (e) => handleFileSelect(e as any, 'camera');
    input.click();
  };

  const handleGallerySelect = () => {
    // Create a file input for gallery selection
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = acceptedFormats.join(',');
    input.onchange = (e) => handleFileSelect(e as any, 'gallery');
    input.click();
  };

  const handleFileSelect_Browser = () => {
    // Create a file input for file browser
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = acceptedFormats.join(',');
    input.onchange = (e) => handleFileSelect(e as any, 'browser');
    input.click();
  };

  const handleRemovePhoto = () => {
    // This will be implemented when we add the remove functionality
    console.log('Remove photo clicked');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-2xl border shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Change Profile Picture
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current Image Preview */}
        {currentImageUrl && (
          <div className="mb-6">
            <p className="text-sm font-medium text-foreground mb-3">Current Photo</p>
            <div className="flex items-center gap-4">
              <div 
                className="h-16 w-16 rounded-full bg-cover bg-center bg-no-repeat border-2 border-border"
                style={{ backgroundImage: `url(${currentImageUrl})` }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemovePhoto}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Photo
              </Button>
            </div>
          </div>
        )}

        {/* Upload Options */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground mb-4">
            Choose a new photo from:
          </p>

          {/* Camera Option */}
          <button
            onClick={handleCameraCapture}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Camera className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Camera</p>
              <p className="text-sm text-muted-foreground">Take a new photo</p>
            </div>
          </button>

          {/* Gallery Option */}
          <button
            onClick={handleGallerySelect}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Image className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Gallery</p>
              <p className="text-sm text-muted-foreground">Choose from photos</p>
            </div>
          </button>

          {/* File Browser Option */}
          <button
            onClick={handleFileSelect_Browser}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Browse Files</p>
              <p className="text-sm text-muted-foreground">Select from computer</p>
            </div>
          </button>
        </div>

        {/* File Info */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Supported formats:</strong> JPEG, PNG, WebP, GIF<br />
            <strong>Maximum size:</strong> {maxFileSize}MB<br />
            <strong>Recommended:</strong> Square images work best
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadInterface;