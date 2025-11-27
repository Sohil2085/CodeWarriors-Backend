import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const removeLocalFile = async (localFilePath) => {
  if (!localFilePath) return;

  try {
    await fs.unlink(localFilePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to cleanup local upload:", error.message);
    }
  }
};

const uploadCloudinary = async (localFilePath, options = {}) => {
  if (!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: process.env.CLOUDINARY_FOLDER || undefined,
      ...options,
    });

    await removeLocalFile(localFilePath);
    console.log("file successfully uploaded", response.secure_url || response.url);
    return response;
  } catch (error) {
    await removeLocalFile(localFilePath);
    console.error("Cloudinary upload failed:", error.message);
    return null;
  }
};

export { uploadCloudinary };