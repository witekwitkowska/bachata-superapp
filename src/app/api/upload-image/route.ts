import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { auth } from "@/auth";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryFolder = "superapp";

// Type for Cloudinary upload result
interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "File must be an image" },
        { status: 400 }
      );
    }

    // Get image provider configuration from MongoDB
    // const { db } = await connectToDatabase();
    // const collection = db.collection("website-elements");

    // const imageProviderElement = await collection.findOne({
    //   type: "image-provider",
    // });
    const currentProvider = "cloudinary";

    let uploadResult;

    try {
      // Upload to the configured provider
      if (currentProvider === "cloudinary") {
        // Convert File to buffer for Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary using the package
        const result = await cloudinary.v2.uploader
          .upload_stream(
            {
              folder: cloudinaryFolder,
              resource_type: "image",
              allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
            },
            (error, result) => {
              if (error) {
                throw new Error(`Cloudinary upload failed: ${error.message}`);
              }
              return result;
            }
          )
          .end(buffer);

        // Wait for the upload to complete
        const cloudinaryResult = await new Promise<CloudinaryUploadResult>(
          (resolve, reject) => {
            cloudinary.v2.uploader
              .upload_stream(
                {
                  folder: cloudinaryFolder,
                  resource_type: "image",
                  allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
                },
                (error, result) => {
                  if (error) {
                    reject(
                      new Error(`Cloudinary upload failed: ${error.message}`)
                    );
                  } else {
                    resolve(result as CloudinaryUploadResult);
                  }
                }
              )
              .end(buffer);
          }
        );

        // Format the result to match our UploadedImage interface
        uploadResult = {
          id: cloudinaryResult.public_id,
          url: cloudinaryResult.secure_url,
          display_url: cloudinaryResult.secure_url,
          delete_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy/${cloudinaryResult.public_id}`,
          title: file.name,
          size: file.size,
          uploaded_at: new Date(),
        };
      } else {
        // Fallback to ImgBB if needed
        const { uploadToImgBB } = await import("@/lib/imgbb-upload");
        uploadResult = await uploadToImgBB(file);
      }

      return NextResponse.json({
        success: true,
        data: uploadResult,
        provider: currentProvider,
        message: `Image uploaded successfully to ${currentProvider}`,
      });
    } catch (uploadError) {
      // If primary provider fails, try fallback
      if (true) {
        //   if (imageProviderElement?.content?.fallbackEnabled) {
        const fallbackProvider =
          currentProvider === "cloudinary" ? "imgbb" : "cloudinary";

        try {
          if (fallbackProvider === "cloudinary") {
            // Convert File to buffer for Cloudinary fallback
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const cloudinaryResult = await new Promise<CloudinaryUploadResult>(
              (resolve, reject) => {
                cloudinary.v2.uploader
                  .upload_stream(
                    {
                      folder: cloudinaryFolder,
                      resource_type: "image",
                      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
                    },
                    (error, result) => {
                      if (error) {
                        reject(
                          new Error(
                            `Cloudinary upload failed: ${error.message}`
                          )
                        );
                      } else {
                        resolve(result as CloudinaryUploadResult);
                      }
                    }
                  )
                  .end(buffer);
              }
            );

            uploadResult = {
              id: cloudinaryResult.public_id,
              url: cloudinaryResult.secure_url,
              display_url: cloudinaryResult.secure_url,
              delete_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy/${cloudinaryResult.public_id}`,
              title: file.name,
              size: file.size,
              uploaded_at: new Date(),
            };
          } else {
            const { uploadToImgBB } = await import("@/lib/imgbb-upload");
            uploadResult = await uploadToImgBB(file);
          }

          return NextResponse.json({
            success: true,
            data: uploadResult,
            provider: fallbackProvider,
            fallback: true,
            message: `Image uploaded to fallback provider ${fallbackProvider}`,
          });
        } catch (fallbackError) {
          console.error(
            `Fallback to ${fallbackProvider} also failed:`,
            fallbackError
          );
          throw uploadError; // Throw original error
        }
      } else {
        throw uploadError;
      }
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to upload image",
      },
      { status: 500 }
    );
  }
}
