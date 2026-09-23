const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const crypto = require('crypto');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for reports
const reportStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rekber-reports',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    resource_type: 'auto',
    public_id: (req, file) => {
      const timestamp = Date.now();
      const userId = req.user?.id || 'anonymous';
      const originalName = file.originalname.split('.')[0].replace(/\s+/g, '_');
      return `report_${userId}_${timestamp}_${originalName}`;
    }
  }
});

// Storage for chat images
const chatImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rekber-chat',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    resource_type: 'image',
    transformation: [
      { width: 800, height: 600, crop: 'limit' }, // Resize untuk optimasi
      { quality: 'auto:good' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const userId = req.user?.id || 'anonymous';
      const transactionId = req.body?.transaction_id || 'unknown';
      return `chat_${transactionId}_${userId}_${timestamp}`;
    }
  }
});

// Multer for reports
const uploadReports = multer({
  storage: reportStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Multer for chat images
const uploadChatImages = multer({
  storage: chatImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for chat images
    files: 1 // Only 1 image per upload
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('File deleted:', result);
    return result;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
const uploadTransactionShippingCloudinary = multer({
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'transaction_shipping',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ quality: "auto" }, { fetch_format: "auto" }]
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 } // max 5MB
});

// Multer for blog images
const uploadBlogImage = multer({
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "rekber-blog",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "heic", "heif"],
      resource_type: "image",
      transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
      public_id: (req, file) => {
        const timestamp = Date.now();
        const adminId = req.user?.id || "admin";
        const originalName = (file.originalname || "blog-image")
          .split(".")[0]
          .replace(/\s+/g, "_");
        return `blog_${adminId}_${timestamp}_${originalName}`;
      },
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Storage for KYC documents. Two fields are photos, one (selfie_video) is a
// short video, so params/fileFilter branch on file.fieldname instead of
// using one fixed resource_type like the other storages above.
const kycStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const userId = req.user?.id || 'anonymous';
    const timestamp = Date.now();
    if (file.fieldname === 'selfie_video') {
      return {
        folder: 'rekber-kyc',
        resource_type: 'video',
        allowed_formats: ['mp4', 'mov', 'webm'],
        public_id: `kyc_video_${userId}_${timestamp}`,
      };
    }
    return {
      folder: 'rekber-kyc',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      // Tanpa transformation: foto KTP/selfie disimpan persis seperti yang
      // di-upload, tidak di-resize atau di-recompress ulang oleh Cloudinary.
      public_id: `kyc_${file.fieldname}_${userId}_${timestamp}`,
    };
  },
});

const uploadKyc = multer({
  storage: kycStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB, cukup untuk video selfie pendek
  fileFilter: (req, file, cb) => {
    const isVideo = file.fieldname === 'selfie_video';
    const allowedTypes = isVideo
      ? ['video/mp4', 'video/quicktime', 'video/webm']
      : ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(isVideo ? 'Video harus berformat mp4/mov/webm' : 'Foto harus berformat jpg/png/webp'), false);
    }
  },
});

// Multer for product images (attached when creating a transaction, up to 10 files)
const uploadProductImage = multer({
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'rekber-products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      resource_type: 'image',
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }, { quality: 'auto:good' }],
      public_id: (req, file) => {
        const timestamp = Date.now();
        const userId = req.user?.id || 'anonymous';
        const unique = crypto.randomBytes(4).toString('hex');
        return `product_${userId}_${timestamp}_${unique}`;
      }
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // max 5MB per file, up to 10 files
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

module.exports = {
  cloudinary,
  uploadReports,
  uploadChatImages,
  deleteFile,
  uploadTransactionShippingCloudinary,
  uploadBlogImage,
  uploadKyc,
  uploadProductImage
};
