// user.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { encrypt,decrypt } from "../utils/encryption.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { refreshToken, accessToken, role: user.role };
    } catch (error) {
        throw new ApiError(501, "Something went wrong while generating refresh and access token ");
    }
};

const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, address, phoneNumber, locationCoordinates,role } = req.body;

    if (!username || !email || !password || !address || !phoneNumber || !locationCoordinates) {
        throw new ApiError(401, "Username, email, password, address, phone number, and location coordinates are required");
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
        throw new ApiError(409, "Already Exist");
    }

    const user = await User.create({
        username,
        email : encrypt(email),
        password,
        role: role || "user",
        profile: {
            address: encrypt(address), 
            phoneNumber: encrypt(phoneNumber), 
            locationCoordinates: locationCoordinates,
        },
    });

    if (!user) {
        throw new ApiError(500, "Server error while creating user");
    }

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong ");
    }
    // decrypt before sending response to user
    createdUser.email = decrypt(createdUser.email);
    createdUser.profile.address = decrypt(createdUser.profile.address);
    createdUser.profile.phoneNumber = decrypt(createdUser.profile.phoneNumber);

    return res.status(201).json(new ApiResponse(200, createdUser, "User Registered"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(401, "Email and Password is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(500, "No user exist");
    }

    const correctPassword = await user.isPasswordCorrect(password);

    if (!correctPassword) {
        throw new ApiError(401, "Password is not correct");
    }

    const { refreshToken, accessToken, role } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    loggedInUser.email = decrypt(loggedInUser.email);
    loggedInUser.profile.address = decrypt(loggedInUser.profile.address);
    loggedInUser.profile.phoneNumber = decrypt(loggedInUser.profile.phoneNumber);
   

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, { ...options, role })
        .cookie("accessToken", accessToken, { ...options, role })
        .json(new ApiResponse(200, { ...loggedInUser.toObject(), role }, "User Logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User Logged out Successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { username, email, address, phoneNumber, locationCoordinates } = req.body;

    if (!username && !email && !address && !phoneNumber && !locationCoordinates) {
        throw new ApiError(401, "At least one field is required");
    }

    const updateFields = {
        username,
        email:email ? encrypt(email) : undefined,
        profile: {
            address: address ? encrypt(address) : undefined, // Encrypt if provided
            phoneNumber: phoneNumber ? encrypt(phoneNumber) : undefined, // Encrypt if provided
            locationCoordinates:locationCoordinates
        },
    };

    Object.keys(updateFields).forEach((key) => {
        if (updateFields[key] === undefined) {
            delete updateFields[key];
        } else if (key === "profile") {
            Object.keys(updateFields.profile).forEach((profileKey) => {
                if (updateFields.profile[profileencryptKey] === undefined) {
                    delete updateFields.profile[profileKey];
                }
            });
            if (Object.keys(updateFields.profile).length === 0) {
                delete updateFields[key];
            }
        }
    });

    const user = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: updateFields },
        { new: true }
    ).select("-password");

    if (!user) {
        throw new ApiError(500, "Error while Updating");
    }
    user.email = decrypt(user.email);
    user.profile.address = decrypt(user.profile.address);
    user.profile.phoneNumber = decrypt(user.profile.phoneNumber);
   

    return res.status(200).json(new ApiResponse(200, user, "Details updated Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {

    req.user.email = decrypt(req.user.email);
    req.user.profile.address = decrypt(req.user.profile.address);
    req.user.profile.phoneNumber = decrypt(req.user.profile.phoneNumber);
    

    return res.status(200).json(new ApiResponse(200, req.user, "CurrentUser Fetch successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldpassword, newpassword } = req.body;

    if (!oldpassword || !newpassword) {
        throw new ApiError(401, "Old and new password is required");
    }

    const user = await User.findById(req.user._id);
    const correctPassword = await user.isPasswordCorrect(oldpassword);

    if (!correctPassword) {
        throw new ApiError(401, "Old password is incorrect");
    }

    user.password = newpassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed Successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    updateAccountDetails,
    getCurrentUser,
    changeCurrentPassword,
};