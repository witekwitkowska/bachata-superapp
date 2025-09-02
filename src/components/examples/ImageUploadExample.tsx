"use client";

import { ImageUploadWithPreview } from "../image-upload-with-preview";
import { useState } from "react";

/**
 * Example component demonstrating the new "maintain" aspect ratio option
 * for image compression without cropping
 */
export function ImageUploadExample() {
    const [images, setImages] = useState<string[]>([]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Standard Upload (Horizontal Crop)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Images will be cropped to 4:3 aspect ratio
                </p>
                <ImageUploadWithPreview
                    existingImages={images}
                    onImagesChange={setImages}
                    aspectRatio="horizontal"
                    maxImages={5}
                />
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Square Upload</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Images will be cropped to 1:1 aspect ratio
                </p>
                <ImageUploadWithPreview
                    existingImages={images}
                    onImagesChange={setImages}
                    aspectRatio="square"
                    maxImages={5}
                />
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Maintain Aspect Ratio (No Cropping)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Images will maintain their original aspect ratio without any cropping
                </p>
                <ImageUploadWithPreview
                    existingImages={images}
                    onImagesChange={setImages}
                    aspectRatio="maintain"
                    maxImages={5}
                />
            </div>
        </div>
    );
}
