import multer from "multer";

const storage = multer.memoryStorage(); // ✅ Store file in memory instead of disk

const fileFilter = (req, file, cb) => {
    if (!file) {
        return cb(new Error("No file uploaded"), false);
    }
    cb(null, true);
};

export const upload = multer({ storage, fileFilter });
