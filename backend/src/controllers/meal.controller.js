import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Meal } from "../models/meal.model.js";
import geocoder from "../utils/geocoder.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Import uploadOnCloudinary

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
    const meals = await Meal.find();

    if (!meals) {
        throw new ApiError(404, "Meals not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, meals, "Meals fetched successfully"));
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

    let locationCoordinates;
    if (address) {
        const geo = await geocoder.geocode(address);
        if (!geo || geo.length === 0) {
            throw new ApiError(400, "Invalid address");
        }
        locationCoordinates = [geo[0].longitude, geo[0].latitude];
    }

    let imageUrl = null;
    if (req.file) {
        const result = await uploadOnCloudinary(req.file.buffer);
        imageUrl = result?.secure_url;
    }

    const meal = await Meal.findByIdAndUpdate(
        req.params.mealId,
        {
            ...req.body,
            ...(locationCoordinates && { locationCoordinates }),
            ...(imageUrl && { imageUrl }),
        },
        { new: true }
    );

    if (!meal) {
        throw new ApiError(404, "Meal not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, meal, "Meal updated successfully"));
});

const deleteMeal = asyncHandler(async (req, res) => {
    const meal = await Meal.findByIdAndDelete(req.params.mealId);

    if (!meal) {
        throw new ApiError(404, "Meal not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Meal deleted successfully"));
});

const getMealsByChefId = asyncHandler(async (req, res) => {
    const meals = await Meal.find({ chefId: req.user._id });

    if (!meals) {
        throw new ApiError(404, "Meals not found");
    }

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