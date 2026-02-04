const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: 'dtmmpcurr',
  api_key: 983797242283474,
  api_secret: 'yIjBRG-BX4bpWL02Ynx14Z1EfQ8',
});
// CLOUDINARY_CLOUD_NAME=dtmmpcurr
// CLOUDINARY_API_KEY=983797242283474
// CLOUDINARY_API_SECRET=yIjBRG-BX4bpWL02Ynx14Z1EfQ8
// 🔥 VERIFY CLOUDINARY CONNECTION AT STARTUP
cloudinary.api.ping()
  .then(() => {
    console.log("✅ Cloudinary connected successfully");
  })
  .catch((error) => {
    console.error("❌ Cloudinary connection failed:", error.message);
  });

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "products",
    format: file.mimetype.split("/")[1], // jpg, png, webp
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
  }),
});

module.exports = { cloudinary, storage };
