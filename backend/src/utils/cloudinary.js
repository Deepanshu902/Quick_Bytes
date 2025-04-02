import dotenv from "dotenv"; // getting order issue as env is loading for cloudinary so also config it here
dotenv.config();

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (fileBuffer, oldImagePublicId = null) => {
    try {
        if (!fileBuffer) {
            console.log("🚨 No file buffer provided to Cloudinary upload function");
            return null;
        }

        // ✅ Upload file directly from buffer
        const response = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "image", folder: "Quick-Bit" },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            uploadStream.end(fileBuffer); // ✅ Send file buffer to Cloudinary
        });

        if (oldImagePublicId) { // ✅ Delete old file if needed
            const deleteResponse = await cloudinary.uploader.destroy(oldImagePublicId);
            console.log("Old image deleted:", deleteResponse);
        }

        return response;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return null;
    }
};

const deleteCloudinaryFile = async (publicid) => {
    if (!publicid) return null;

    const deleteResponse = await cloudinary.uploader.destroy(publicid);

    return deleteResponse;
};

export { uploadOnCloudinary, deleteCloudinaryFile };
