"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon, Trash2, Crown, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import the compression function
const compressImage = (
    file: File,
    maxWidth = 1200,
    quality = 0.8,
    aspectRatio: "horizontal" | "square" = "horizontal"
): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const originalWidth = img.width;
                const originalHeight = img.height;

                let sx = 0,
                    sy = 0,
                    sWidth = originalWidth,
                    sHeight = originalHeight;

                if (originalHeight > originalWidth) {
                    const targetAspectRatio = aspectRatio === "horizontal" ? 4 / 3 : 1;
                    const targetHeight = originalWidth / targetAspectRatio;

                    sHeight = Math.min(originalHeight, targetHeight);
                    sy = (originalHeight - sHeight) / 2;
                }

                const scale = maxWidth / sWidth;
                const width = Math.min(maxWidth, sWidth);
                const height = aspectRatio === "square" ? width : sHeight * scale;

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
                }

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Canvas.toBlob returned null"));
                        }
                    },
                    "image/jpeg",
                    quality
                );
            };

            img.onerror = () => reject(new Error("Image failed to load"));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
};

interface ImageData {
    id: string;
    url: string;
    display_url: string;
    delete_url: string;
    title: string;
    size: number;
    uploaded_at: Date;
}

interface SortableImage {
    id: string;
    url: string;
    isProfilePhoto: boolean;
    order: number;
}

interface ImageUploadWithPreviewProps {
    existingImages?: string[]; // URLs of existing images
    onImagesChange: (images: string[]) => void; // Callback when images change
    onUploadedImagesChange?: (images: ImageData[]) => void; // Callback for newly uploaded images
    maxImages?: number;
    multiple?: boolean;
    disabled?: boolean;
    className?: string;
    showExistingImages?: boolean; // Whether to show existing images
    allowRemoveExisting?: boolean; // Whether to allow removing existing images
    onStartUpload?: () => void;
    onEndUpload?: () => void;
    // New props for profile photo and reordering
    allowProfilePhotoSelection?: boolean; // Whether to allow selecting a profile photo
    allowReordering?: boolean; // Whether to allow reordering images
    onProfilePhotoChange?: (imageUrl: string | null) => void; // Callback when profile photo changes
    onImagesReorder?: (images: string[]) => void; // Callback when images are reordered
    currentProfilePhoto?: string; // Current profile photo URL
}

export function ImageUploadWithPreview({
    existingImages = [],
    onImagesChange,
    onUploadedImagesChange,
    maxImages = 10,
    multiple = true,
    disabled = false,
    className = "",
    showExistingImages = true,
    allowRemoveExisting = true,
    onStartUpload,
    onEndUpload,
    allowProfilePhotoSelection = false,
    allowReordering = false,
    onProfilePhotoChange,
    onImagesReorder,
    currentProfilePhoto = "",
}: ImageUploadWithPreviewProps) {
    const { toast } = useToast();
    const [uploadedFiles, setUploadedFiles] = useState<ImageData[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [draggedImage, setDraggedImage] = useState<string | null>(null);
    const [dragOverImage, setDragOverImage] = useState<string | null>(null);

    // Create sortable images array combining existing and new images, avoiding duplicates

    const existingImageUrls = new Set(existingImages);
    const newImageUrls = uploadedFiles.map(f => f.url).filter(url => !existingImageUrls.has(url));
    const allImages = [...existingImages, ...newImageUrls];

    const sortableImages: SortableImage[] = allImages.map((url, index) => ({
        id: `image-${index}`,
        url,
        isProfilePhoto: url === currentProfilePhoto,
        order: index,
    }));

    const handleFileUpload = useCallback(async (files: FileList | File[]) => {
        if (disabled || isUploading) return;

        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => {
            if (!file.type.startsWith('image/')) {
                toast({
                    title: "Invalid File",
                    description: `${file.name} is not an image file. Please select only image files.`,
                    variant: "destructive",
                });
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Check if we're at the limit
        const totalImages = existingImages.length + uploadedFiles.length + validFiles.length;
        if (totalImages > maxImages) {
            toast({
                title: "Too Many Images",
                description: `Maximum ${maxImages} images allowed. You can upload ${maxImages - existingImages.length - uploadedFiles.length} more.`,
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        onStartUpload?.();
        try {
            // Process and upload each file with compression
            const uploadPromises = validFiles.map(async (file) => {
                // Check if compression should be applied (files > 1MB)
                const oneMB = 1024 * 1024;
                const shouldCompress = file.size > oneMB;

                let processedFile: File;

                if (shouldCompress) {
                    // Start with higher quality and reduce if needed
                    let quality = 0.9;
                    let finalBlob = await compressImage(file, 1200, quality, "horizontal");

                    // If still too large, reduce quality in larger steps for efficiency
                    while (finalBlob.size > oneMB && quality > 0.1) {
                        quality -= 0.15;
                        finalBlob = await compressImage(file, 1200, quality, "horizontal");
                    }

                    // If we still can't get under 1MB, try reducing dimensions
                    if (finalBlob.size > oneMB) {
                        let maxWidth = 1000;
                        while (finalBlob.size > oneMB && maxWidth > 400) {
                            maxWidth -= 100;
                            finalBlob = await compressImage(file, maxWidth, 0.5, "horizontal");
                        }
                    }

                    // Create file from compressed blob
                    processedFile = new File([finalBlob], file.name, {
                        type: "image/jpeg",
                    });
                } else {
                    processedFile = file;
                }

                // Upload the processed file through the API
                const formData = new FormData();
                formData.append('file', processedFile);


                const response = await fetch('/api/upload-image', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.message || 'Upload failed');
                }

                return result.data;
            });

            const uploadedResults = await Promise.all(uploadPromises);

            // Update local state
            setUploadedFiles(prev => [...prev, ...uploadedResults]);

            // Update parent component
            const allImageUrls = [...existingImages, ...uploadedFiles, ...uploadedResults].map(img =>
                typeof img === 'string' ? img : img.url
            );
            onImagesChange(allImageUrls);

            // Callback for newly uploaded images if provided
            if (onUploadedImagesChange) {
                onUploadedImagesChange([...uploadedFiles, ...uploadedResults]);
            }

            toast({
                title: "Upload Successful",
                description: `Successfully uploaded ${validFiles.length} image${validFiles.length > 1 ? 's' : ''}`,
            });

        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: "Upload Failed",
                description: error instanceof Error ? error.message : "Failed to upload one or more images. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
            onEndUpload?.();
        }
    }, [disabled, isUploading, existingImages, uploadedFiles, maxImages, onImagesChange, onUploadedImagesChange, toast]);

    const handleRemoveImage = useCallback((index: number, isExisting: boolean) => {
        if (isExisting) {
            // Remove from existing images
            const newExistingImages = existingImages.filter((_, i) => i !== index);
            const newImages = [...newExistingImages, ...uploadedFiles.map(img => img.url)];
            onImagesChange(newImages);

            // Check if we're removing the profile photo
            const removedImage = existingImages[index];
            if (removedImage === currentProfilePhoto && onProfilePhotoChange) {
                onProfilePhotoChange(null);
            }
        } else {
            // Remove from newly uploaded images
            const newUploadedFiles = uploadedFiles.filter((_, i) => i !== index);
            setUploadedFiles(newUploadedFiles);
            const newImages = [...existingImages, ...newUploadedFiles.map(img => img.url)];
            onImagesChange(newImages);

            // Check if we're removing the profile photo
            const removedImage = uploadedFiles[index];
            if (removedImage.url === currentProfilePhoto && onProfilePhotoChange) {
                onProfilePhotoChange(null);
            }
        }
    }, [existingImages, uploadedFiles, onImagesChange, currentProfilePhoto, onProfilePhotoChange]);

    const handleRemoveAllNew = useCallback(() => {
        setUploadedFiles([]);
        onImagesChange(existingImages);

        // Check if any of the removed images was the profile photo
        const removedImages = uploadedFiles.map(f => f.url);
        if (removedImages.includes(currentProfilePhoto) && onProfilePhotoChange) {
            onProfilePhotoChange(null);
        }
    }, [existingImages, onImagesChange, uploadedFiles, currentProfilePhoto, onProfilePhotoChange]);

    const handleProfilePhotoSelect = useCallback((imageUrl: string) => {
        if (onProfilePhotoChange) {
            onProfilePhotoChange(imageUrl);
            toast({
                title: "Profile Photo Updated",
                description: "Profile photo has been set successfully!",
            });
        }
    }, [onProfilePhotoChange, toast]);

    const handleDragStart = useCallback((e: React.DragEvent, imageUrl: string) => {
        if (!allowReordering) return;
        setDraggedImage(imageUrl);
        e.dataTransfer.effectAllowed = 'move';
    }, [allowReordering]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!allowReordering) return;
        e.dataTransfer.dropEffect = 'move';
    }, [allowReordering]);

    const handleDragEnter = useCallback((e: React.DragEvent, imageUrl: string) => {
        if (!allowReordering) return;
        e.preventDefault();
        setDragOverImage(imageUrl);
    }, [allowReordering]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        if (!allowReordering) return;
        e.preventDefault();
        setDragOverImage(null);
    }, [allowReordering]);

    const handleDrop = useCallback((e: React.DragEvent, targetImageUrl: string) => {
        if (!allowReordering || !draggedImage || draggedImage === targetImageUrl) return;
        e.preventDefault();
        e.stopPropagation();

        const draggedIndex = allImages.indexOf(draggedImage);
        const targetIndex = allImages.indexOf(targetImageUrl);

        if (draggedIndex === -1 || targetIndex === -1) return;

        // Create new array with reordered images
        const newImages = [...allImages];
        const [draggedItem] = newImages.splice(draggedIndex, 1);
        newImages.splice(targetIndex, 0, draggedItem);

        // Update parent component
        onImagesChange(newImages);

        // Call reorder callback if provided
        if (onImagesReorder) {
            onImagesReorder(newImages);
        }

        setDraggedImage(null);
        setDragOverImage(null);

        toast({
            title: "Images Reordered",
            description: "Image order has been updated successfully!",
        });
    }, [allowReordering, draggedImage, allImages, onImagesChange, onImagesReorder, toast]);

    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && !isUploading) {
            handleFileUpload(e.dataTransfer.files);
        }
    }, [disabled, isUploading, handleFileUpload]);

    const totalImages = existingImages.length + uploadedFiles.length;
    const canUpload = totalImages < maxImages && !disabled;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Upload Controls */}
            <div className="flex items-center gap-4">
                <label className="relative cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        multiple={multiple}
                        onChange={(e) => {
                            const files = e.target.files;
                            if (files) {
                                handleFileUpload(files);
                            }
                        }}
                        className="hidden"
                        disabled={!canUpload || isUploading}
                    />
                    <div className={`
            flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed transition-all duration-200
            ${!canUpload || isUploading
                            ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                        }
          `}>
                        <Upload className={`w-4 h-4 ${!canUpload || isUploading ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm font-medium ${!canUpload || isUploading ? 'text-gray-400' : 'text-gray-600'}`}>
                            {isUploading ? 'Uploading...' : `Choose Image${multiple ? 's' : ''}`}
                        </span>
                    </div>
                </label>

                {uploadedFiles.length > 0 && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveAllNew}
                        disabled={isUploading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove All New
                    </Button>
                )}
            </div>

            {/* Drag & Drop Area */}
            {canUpload && (
                <div
                    className={`
            p-6 border-2 border-dashed rounded-lg text-center transition-all duration-200
            ${isUploading
                            ? 'border-gray-300 bg-gray-50 dark:bg-gray-800'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }
          `}
                    onDragOver={handleDragOver}
                    onDrop={handleFileDrop}
                >
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${isUploading ? 'text-gray-400' : 'text-gray-500'}`} />
                    <p className={`text-sm ${isUploading ? 'text-gray-400' : 'text-gray-600'}`}>
                        {isUploading ? 'Uploading...' : 'Drag and drop images here, or click the button above'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Supports: JPG, PNG, GIF, WebP • Max: {maxImages} images
                    </p>
                </div>
            )}

            {/* Image Count */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Badge variant="outline">
                    {totalImages} / {maxImages} images
                </Badge>
                {isUploading && (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        Uploading...
                    </div>
                )}
            </div>

            {/* All Images Grid with Reordering */}
            {totalImages > 0 && (
                <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        {allowReordering && <GripVertical className="w-4 h-4" />}
                        All Images
                        {allowProfilePhotoSelection && (
                            <span className="text-xs text-gray-500 ml-2">
                                (Click crown icon to set as profile photo)
                            </span>
                        )}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {sortableImages.map((image, index) => {
                            const isExisting = existingImageUrls.has(image.url);
                            const imageData = isExisting ? null : uploadedFiles.find(f => f.url === image.url);

                            return (
                                <div
                                    key={image.id}
                                    className={`relative group ${allowReordering ? 'cursor-move' : ''}`}
                                    draggable={allowReordering}
                                    onDragStart={(e) => handleDragStart(e, image.url)}
                                    onDragOver={handleDragOver}
                                    onDragEnter={(e) => handleDragEnter(e, image.url)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, image.url)}
                                >
                                    <div className={`
                                        aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200
                                        ${image.isProfilePhoto
                                            ? 'border-blue-500 ring-2 ring-blue-200'
                                            : dragOverImage === image.url
                                                ? 'border-green-400 ring-2 ring-green-200'
                                                : 'border-gray-200 dark:border-gray-700'
                                        }
                                    `}>
                                        <img
                                            src={image.url}
                                            alt={imageData?.title || `Image ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>

                                    {/* Profile Photo Crown */}
                                    {allowProfilePhotoSelection && image.isProfilePhoto && (
                                        <div className="absolute top-2 left-2">
                                            <Badge variant="default" className="bg-blue-600 text-white text-xs flex items-center gap-1">
                                                <Crown className="w-3 h-3" />
                                                Profile
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Profile Photo Selection Button */}
                                    {allowProfilePhotoSelection && !image.isProfilePhoto && (
                                        <button
                                            type="button"
                                            onClick={() => handleProfilePhotoSelect(image.url)}
                                            className="absolute top-2 left-2 w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Set as profile photo"
                                        >
                                            <Crown className="w-3 h-3" />
                                        </button>
                                    )}

                                    {/* Remove Button */}
                                    {(allowRemoveExisting || !isExisting) && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index, isExisting)}
                                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove image"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}

                                    {/* Image Label */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 truncate">
                                        {imageData?.title || `Image ${index + 1}`}
                                    </div>

                                    {/* New Badge */}
                                    {!isExisting && (
                                        <div className="absolute top-2 left-2">
                                            <Badge variant="secondary" className="text-xs">New</Badge>
                                        </div>
                                    )}

                                    {/* Drag Handle */}
                                    {allowReordering && (
                                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <GripVertical className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {totalImages === 0 && !isUploading && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No images uploaded yet</p>
                    <p className="text-sm">Upload images to get started</p>
                </div>
            )}
        </div>
    );
}
