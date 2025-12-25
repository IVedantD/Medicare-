// Profile Image Management Types

export interface ImageMetadata {
  id: string;
  userId: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };
  format: string;
  uploadDate: Date;
  isActive: boolean;
  thumbnailUrl: string;
  mediumUrl: string;
  fullUrl: string;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zoom: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    size: number;
    dimensions: { width: number; height: number };
    format: string;
  };
}

export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  quality: number;
}

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

export interface ImageHistoryItem {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  uploadDate: Date;
  isActive: boolean;
}

// Component Props Interfaces

export interface ProfileAvatarProps {
  user: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  size?: 'small' | 'medium' | 'large';
  editable?: boolean;
  onImageUpdate?: (imageUrl: string) => void;
  className?: string;
}

export interface UploadInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected: (file: File) => void;
  currentImageUrl?: string;
  maxFileSize?: number;
  acceptedFormats?: string[];
}

export interface ImageCropperProps {
  image: File | string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
  showRotationControls?: boolean;
  showZoomControls?: boolean;
}

export interface ImagePreviewProps {
  file: File;
  onContinue: () => void;
  onChooseDifferent: () => void;
  maxFileSize: number;
}

// Service Interfaces

export interface ImageProcessorService {
  compressImage(file: File, options: CompressionOptions): Promise<File>;
  convertToWebP(file: File): Promise<File>;
  generateThumbnails(file: File, sizes: number[]): Promise<File[]>;
  validateImage(file: File): Promise<ValidationResult>;
}

export interface UploadService {
  uploadProfileImage(
    file: File, 
    userId: string, 
    onProgress?: (progress: number) => void
  ): Promise<UploadResult>;
  deleteProfileImage(userId: string): Promise<void>;
  getImageHistory(userId: string): Promise<ImageHistoryItem[]>;
}

// Constants

export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_FILE_SIZE_MB = 5;
export const PROFILE_IMAGE_SIZES = {
  thumbnail: 64,
  medium: 128,
  large: 256,
  full: 512
};

export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxSizeMB: 2,
  maxWidthOrHeight: 512,
  useWebWorker: true,
  quality: 0.8
};