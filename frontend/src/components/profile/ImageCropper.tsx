import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { RotateCcw, ZoomIn, ZoomOut, RotateCcw as RotateLeft, RotateCw as RotateRight, X, Check } from 'lucide-react';
import { ImageCropperProps } from '@/types/profile-image';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const ImageCropper: React.FC<ImageCropperProps> = ({
  image,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  cropShape = 'round',
  showRotationControls = true,
  showZoomControls = true
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const imageUrl = typeof image === 'string' ? image : URL.createObjectURL(image);

  const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any,
    rotation = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg', 0.9);
    });
  };

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation((prev) => prev + 90);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" />
      
      {/* Modal */}
      <div className="relative bg-card rounded-2xl border shadow-2xl w-full max-w-4xl mx-4 h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Crop Your Profile Picture
          </h2>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="flex-1 relative bg-black">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            cropShape={cropShape}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            showGrid={false}
            style={{
              containerStyle: {
                width: '100%',
                height: '100%',
                backgroundColor: '#000'
              }
            }}
          />
          
          {/* Preview Circle */}
          <div className="absolute top-4 right-4 bg-black/70 rounded-lg p-3">
            <p className="text-white text-xs mb-2">Preview:</p>
            <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden">
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${imageUrl})`,
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center'
                }}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-t bg-card space-y-4">
          {/* Zoom Control */}
          {showZoomControls && (
            <div className="flex items-center gap-4">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <Slider
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground min-w-[3rem]">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          )}

          {/* Rotation Controls */}
          {showRotationControls && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotateLeft}
                className="flex items-center gap-2"
              >
                <RotateLeft className="h-4 w-4" />
                Rotate Left
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotateRight}
                className="flex items-center gap-2"
              >
                <RotateRight className="h-4 w-4" />
                Rotate Right
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {rotation}°
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={handleApplyCrop}
              disabled={isProcessing || !croppedAreaPixels}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Apply Crop
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tips */}
        <div className="px-6 pb-6">
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong>💡 Tips:</strong> Drag to move the image, use the slider to zoom, 
              and rotate buttons to adjust orientation. The preview shows how your profile picture will look.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;