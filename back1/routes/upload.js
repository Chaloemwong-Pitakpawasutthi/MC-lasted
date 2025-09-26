// routes/upload.js
const express = require("express");
const upload = require("../middleware/upload");

const router = express.Router();

const handler = (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    res.json({
      message: "Upload success",
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  });
};

// ✅ รองรับทั้ง /api/upload (POST /) และ /api/files/upload (POST /upload)
router.post("/", handler);
router.post("/upload", handler);

module.exports = router;
