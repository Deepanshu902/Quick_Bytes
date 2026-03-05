import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Meal } from "../models/meal.model.js";
import geocoder from "../utils/geocoder.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createMeal = asyncHandler(async (req, res) => {
    const { name, description, price, category, address } = req.body;

    if (!name || !description || !price || !category || !address) {
        throw new ApiError(400, "All fields are required");
    }

    const geo = await geocoder.geocode(address);
    if (!geo || geo.length === 0) {
        throw new ApiError(400, "Invalid address");
    }

    const locationCoordinates = [geo[0].longitude, geo[0].latitude];

    let imageUrl = null;
    if (req.file) {
        const result = await uploadOnCloudinary(req.file.buffer);
        imageUrl = result?.secure_url;
    }

    const meal = await Meal.create({
        name,
        description,
        price,
        category,
        chefId: req.user._id,
        locationCoordinates,
        imageUrl,
    });

    if (!meal) {
        throw new ApiError(500, "Failed to create meal");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, meal, "Meal created successfully"));
});

const getAllMeals = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [meals, total] = await Promise.all([
        Meal.find().skip(skip).limit(limit),
        Meal.countDocuments(),
    ]);

    return res.status(200).json(new ApiResponse(200, {
        meals,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    }, "Meals fetched successfully"));
});

const getMealById = asyncHandler(async (req, res) => {
    const meal = await Meal.findById(req.params.mealId);

    if (!meal) {
        throw new ApiError(404, "Meal not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, meal, "Meal fetched successfully"));
});

const updateMeal = asyncHandler(async (req, res) => {
    const { name, description, price, category, address } = req.body;

    // Ownership check — only the chef who created this meal can update it
    const existingMeal = await Meal.findById(req.params.mealId);
    if (!existingMeal) {
        throw new ApiError(404, "Meal not found");
    }
    if (existingMeal.chefId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this meal");
    }

    let locationCoordinates;
    if (address) {
        try {
            const geo = await geocoder.geocode(address);
            if (geo && geo.length > 0) {
                locationCoordinates = [geo[0].longitude, geo[0].latitude];
            }
        } catch (geoError) {
            console.error("Geocoder error:", geoError.message);
        }
    }

    let imageUrl;
    if (req.file) {
        const result = await uploadOnCloudinary(req.file.buffer);
        imageUrl = result?.secure_url;
    }

    // Only update whitelisted fields — never spread req.body directly
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (category) updateData.category = category;
    if (locationCoordinates) updateData.locationCoordinates = locationCoordinates;
    if (imageUrl) updateData.imageUrl = imageUrl;

    const meal = await Meal.findByIdAndUpdate(
        req.params.mealId,
        updateData,
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, meal, "Meal updated successfully"));
});

const deleteMeal = asyncHandler(async (req, res) => {
    // Ownership check — only the chef who created this meal can delete it
    const meal = await Meal.findById(req.params.mealId);
    if (!meal) {
        throw new ApiError(404, "Meal not found");
    }
    if (meal.chefId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this meal");
    }

    await meal.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Meal deleted successfully"));
});

const getMealsByChefId = asyncHandler(async (req, res) => {
    const meals = await Meal.find({ chefId: req.user._id });

    // .find() returns [] not null, so no 404 needed — just return the empty array
    return res
        .status(200)
        .json(new ApiResponse(200, meals, "Meals fetched successfully"));
});

export {
    createMeal,
    getAllMeals,
    getMealById,
    updateMeal,
    deleteMeal,
    getMealsByChefId,
};