// middlewares/imageModeration.middleware.js
import dotenv from 'dotenv';
dotenv.config();
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import vision from '@google-cloud/vision';

process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH;

const client = new vision.ImageAnnotatorClient();

const FOOD_KEYWORDS = [
    'food', 'dish', 'meal', 'plate', 'dal', 'lentils', 'curry',
    'vegetable', 'stew', 'rice', 'bread', 'roti', 'naan',
    'salad', 'fruit', 'dessert',
];

const moderateImage = asyncHandler(async (req, res, next) => {
    // Image is optional on updates — skip moderation if no file
    if (!req.file || !req.file.buffer) {
        return next();
    }

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


    if (
        safeSearch.adult === 'VERY_LIKELY' ||
        safeSearch.racy === 'VERY_LIKELY' ||
        safeSearch.porn === 'VERY_LIKELY'
    ) {
        throw new ApiError(400, "Inappropriate content detected");
    }

    const matchesKeyword = (str) => FOOD_KEYWORDS.some((kw) => str?.toLowerCase().includes(kw));

    const isFoodObject = objects?.some((obj) => matchesKeyword(obj.name));
    const isFoodLabel = labels?.some((label) => matchesKeyword(label.description));

    if (!isFoodObject && !isFoodLabel) {
        throw new ApiError(400, "Uploaded image does not appear to be food");
    }

    next();
});

export { moderateImage };