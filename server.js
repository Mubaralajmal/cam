const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS (so frontend JS can talk to backend if hosted separately)
app.use(cors());

// ✅ Serve uploads folder (so images & videos are accessible)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Serve index.html and other static files
app.use(express.static(__dirname));

// ----------------- MULTER CONFIG -----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// ✅ Upload file
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ file: req.file.filename });
});

// ✅ Get list of files
app.get("/files", (req, res) => {
  const dir = path.join(__dirname, "uploads");
  if (!fs.existsSync(dir)) return res.json([]);
  const files = fs.readdirSync(dir);
  res.json(files);
});

// ✅ Delete file
app.delete("/delete/:filename", (req, res) => {
  const filepath = path.join(__dirname, "uploads", req.params.filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    return res.json({ success: true });
  }
  res.status(404).json({ error: "File not found" });
});

// ✅ Default route (serve index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
