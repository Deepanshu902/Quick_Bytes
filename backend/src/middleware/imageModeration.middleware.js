// middlewares/imageModeration.middleware.js
import dotenv from 'dotenv';
dotenv.config();
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import vision from '@google-cloud/vision';

// Set the GOOGLE_APPLICATION_CREDENTIALS environment variable
process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH;

const client = new vision.ImageAnnotatorClient();

const moderateImage = asyncHandler(async (req, res, next) => {
    if (!req.file || !req.file.buffer) {
        throw new ApiError(400, "No image uploaded");
    }

    try {
        const request = {
            image: { content: req.file.buffer },
            features: [
                { type: 'SAFE_SEARCH_DETECTION' },
                { type: 'OBJECT_DETECTION', maxResults: 10 },
                { type: 'LABEL_DETECTION', maxResults: 10 }
            ],
        };

        const [result] = await client.annotateImage(request);
        const safeSearch = result.safeSearchAnnotation;
        const objects = result.localizedObjectAnnotations;
        const labels = result.labelAnnotations;

        // Safe Search Check
        if (
            safeSearch.adult === 'VERY_LIKELY' ||
            safeSearch.racy === 'VERY_LIKELY' ||
            safeSearch.porn === 'VERY_LIKELY'
        ) {
            throw new ApiError(400, "Inappropriate content detected");
        }

        // Food Check (Object and Label Detection)
        const isFoodObject = objects?.some((object) =>
            object.name?.toLowerCase().includes('food') ||
            object.name?.toLowerCase().includes('dish') ||
            object.name?.toLowerCase().includes('meal') ||
            object.name?.toLowerCase().includes('plate') ||
            object.name?.toLowerCase().includes('dal') ||
            object.name?.toLowerCase().includes('lentils') ||
            object.name?.toLowerCase().includes('curry') ||
            object.name?.toLowerCase().includes('vegetable') ||
            object.name?.toLowerCase().includes('stew') ||
            object.name?.toLowerCase().includes('rice') ||
            object.name?.toLowerCase().includes('bread') ||
            object.name?.toLowerCase().includes('roti') ||
            object.name?.toLowerCase().includes('naan') ||
            object.name?.toLowerCase().includes('salad') ||
            object.name?.toLowerCase().includes('fruit') ||
            object.name?.toLowerCase().includes('dessert')
        );

        const isFoodLabel = labels?.some((label) =>
            label.description?.toLowerCase().includes('food') ||
            label.description?.toLowerCase().includes('dish') ||
            label.description?.toLowerCase().includes('meal') ||
            label.description?.toLowerCase().includes('plate') ||
            label.description?.toLowerCase().includes('dal') ||
            label.description?.toLowerCase().includes('lentils') ||
            label.description?.toLowerCase().includes('curry') ||
            label.description?.toLowerCase().includes('vegetable') ||
            label.description?.toLowerCase().includes('stew') ||
            label.description?.toLowerCase().includes('rice') ||
            label.description?.toLowerCase().includes('bread') ||
            label.description?.toLowerCase().includes('roti') ||
            label.description?.toLowerCase().includes('naan') ||
            label.description?.toLowerCase().includes('salad') ||
            label.description?.toLowerCase().includes('fruit') ||
            label.description?.toLowerCase().includes('dessert')
        );

        if (!isFoodObject && !isFoodLabel) {
            throw new ApiError(400, "Uploaded image is not food");
        }

        next(); // Image is safe and food, proceed
    } catch (error) {
        console.error('Please upload food images only ', error);
        throw new ApiError(500, "Please upload food images only ");
    }
});

export { moderateImage };