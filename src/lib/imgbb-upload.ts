export interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url: string;
    display_url: string;
    size: number;
    delete_url: string;
    time: number;
    expiration: number;
  };
  success: boolean;
  status: number;
}

export interface UploadedImage {
  id: string;
  url: string;
  display_url: string;
  delete_url: string;
  title: string;
  size: number;
  uploaded_at: Date;
}

export const uploadToImgBB = async (file: File): Promise<UploadedImage> => {
  try {
    // Get ImgBB API key from server-side environment only
    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      throw new Error(
        "ImgBB API key not configured. Please set IMGBB_API_KEY environment variable."
      );
    }

    // Convert file to base64 for the API
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extract the base64 data part (remove the data:image/...;base64, prefix)
        const base64 = result.split(",")[1];

        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Call our API endpoint
    const response = await fetch("/api/photo/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl: base64Data }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Photo upload API error:", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 500),
      });
      throw new Error(
        `HTTP error! status: ${response.status} - ${errorText.substring(
          0,
          200
        )}`
      );
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    // Return the uploaded image data
    return {
      id: result.data?.id || `img_${Date.now()}`,
      url: result.data?.url || result.url,
      display_url: result.data?.display_url || result.data?.url || result.url,
      delete_url: result.data?.delete_url || "",
      title: result.data?.title || file.name,
      size: result.data?.size || file.size,
      uploaded_at: new Date(),
    };
  } catch (error) {
    throw new Error(
      `Failed to upload image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const uploadBase64ToImgBB = async (
  base64Data: string,
  filename: string = "image.jpg"
): Promise<UploadedImage> => {
  try {
    // Call our API endpoint directly with the base64 data
    const response = await fetch("/api/photo/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl: base64Data }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    // Return the uploaded image data
    return {
      id: result.data?.id || `img_${Date.now()}`,
      url: result.data?.url || result.url,
      display_url: result.data?.display_url || result.data?.url || result.url,
      delete_url: result.data?.delete_url || "",
      title: result.data?.title || filename,
      size: result.data?.size || 0,
      uploaded_at: new Date(),
    };
  } catch (error) {
    throw new Error(
      `Failed to upload image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const compressImage = (
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

    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
};

export const uploadImageWithCompression = async (
  file: File,
  aspectRatio: "horizontal" | "square" = "horizontal"
): Promise<UploadedImage> => {
  if (!file) {
    throw new Error("No file provided");
  }

  // Check if file size is greater than 1MB (1,048,576 bytes)
  const oneMB = 1024 * 1024;
  const shouldCompress = file.size > oneMB;

  let processedFile: File;

  if (shouldCompress) {
    // Start with higher quality and reduce if needed
    let quality = 0.9;
    let finalBlob = await compressImage(file, 1200, quality, aspectRatio);

    // If still too large, reduce quality in larger steps for efficiency
    while (finalBlob.size > oneMB && quality > 0.1) {
      quality -= 0.15;
      finalBlob = await compressImage(file, 1200, quality, aspectRatio);
    }

    // If we still can't get under 1MB, try reducing dimensions
    if (finalBlob.size > oneMB) {
      let maxWidth = 1000;
      while (finalBlob.size > oneMB && maxWidth > 400) {
        maxWidth -= 100;
        finalBlob = await compressImage(file, maxWidth, 0.5, aspectRatio);
      }
    }

    // Create file from compressed blob
    processedFile = new File([finalBlob], file.name, {
      type: "image/jpeg",
    });
  } else {
    processedFile = file;
  }

  return uploadToImgBB(processedFile);
};
