import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { ImagePreviewProps } from '@/types/profile-image';
import { Button } from '@/components/ui/button';

const ImagePreview: React.FC<ImagePreviewProps> = ({
  file,
  onContinue,
  onChooseDifferent,
  maxFileSize
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        setIsLoading(false);
      };
      img.src = url;

      // Cleanup
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileSizeMB = file.size / (1024 * 1024);
  const isOversized = fileSizeMB > maxFileSize;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-card rounded-2xl border shadow-2xl w-full max-w-2xl mx-4 p-6 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Preview Selected Image
          </h2>
          <button
            onClick={onChooseDifferent}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Image Preview */}
        <div className="mb-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 bg-muted rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="relative">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-64 object-contain bg-muted rounded-xl"
              />
              {/* Overlay showing how it will look as profile picture */}
              <div className="absolute top-4 right-4 bg-black/70 rounded-lg p-3">
                <p className="text-white text-xs mb-2">Profile Preview:</p>
                <div 
                  className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-white"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Image Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">File Name</span>
            </div>
            <p className="text-sm text-muted-foreground truncate" title={file.name}>
              {file.name}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-foreground">Dimensions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {imageDimensions ? `${imageDimensions.width} × ${imageDimensions.height}` : 'Loading...'}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-foreground">File Size</span>
              {isOversized && <AlertTriangle className="h-4 w-4 text-destructive" />}
            </div>
            <p className={`text-sm ${isOversized ? 'text-destructive' : 'text-muted-foreground'}`}>
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>

        {/* Warning for oversized files */}
        {isOversized && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="font-medium text-destructive">File Too Large</span>
            </div>
            <p className="text-sm text-destructive/80">
              This file is {fileSizeMB.toFixed(2)}MB, which exceeds the {maxFileSize}MB limit. 
              Please choose a smaller image or we'll compress it automatically.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onChooseDifferent}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Choose Different Image
          </Button>
          <Button
            variant="hero"
            onClick={onContinue}
            className="flex-1"
            disabled={isLoading}
          >
            Continue to Crop
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>💡 Tips:</strong> Square images work best for profile pictures. 
            You'll be able to crop and adjust the image in the next step.
            {isOversized && ' Large files will be automatically compressed to improve performance.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;