import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = async (image: string) => {
  return new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      cloudinary.uploader.upload(
        image,
        { resource_type: "auto" },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Upload failed, result is undefined"));
          } else {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        }
      );
    }
  );
};

export const deleteImageFromCloudinary = async (publicId: string) => {
  return await cloudinary.uploader.destroy(publicId);
};
