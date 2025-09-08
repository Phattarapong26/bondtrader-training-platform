import multer from "multer";
import path from "path";

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify where to store uploaded files
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    // Give the file a unique name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Add the file extension (e.g., .jpg, .png, .mp4)
  },
});

// Filter for allowed file types (for example, images and videos)
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  console.log("File mimetype:", file.mimetype); // Log MIME type for debugging
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "video/mp4",
    "video/quicktime", // Allow QuickTime videos
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    console.error(
      `Invalid file type: ${file.mimetype}. Allowed types are: ${allowedTypes.join(", ")}`
    );
    cb(
      new Error("Invalid file type! Only JPG, PNG, MP4, MOV (QuickTime), and PDF are allowed.") as any,
      false
    ); // Reject the file
  }
};


// Set up the upload middleware with file size limit and file type filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // Adjust the file size limit as needed
});


export default upload;
