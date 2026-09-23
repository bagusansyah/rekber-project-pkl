const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { uploadBlogImage } = require('../config/cloudinary');
const {
  createBlogController,
  getAllBlogsAdminController,
  getBlogByIdAdminController,
  updateBlogController,
  deleteBlogController,
  getPublishedBlogsController,
  getBlogBySlugController
} = require('../controllers/blogsController');

const maybeUploadBlogImage = (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    return uploadBlogImage.single("image")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          status: false,
          error: error.message || "Gagal upload gambar",
        });
      }
      return next();
    });
  }
  return next();
};

// =======================
// ADMIN ROUTES
// =======================
router.get('/admin/all', adminAuthMiddleware, getAllBlogsAdminController);
router.get('/admin/:id', adminAuthMiddleware, getBlogByIdAdminController);
router.post('/', adminAuthMiddleware, maybeUploadBlogImage, createBlogController);
router.put('/:id', adminAuthMiddleware, maybeUploadBlogImage, updateBlogController);
router.delete('/:id', adminAuthMiddleware, deleteBlogController);

// =======================
// PUBLIC ROUTES
// =======================
router.get('/published', getPublishedBlogsController);
router.get('/:slug', getBlogBySlugController);

module.exports = router;
