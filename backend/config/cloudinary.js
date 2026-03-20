

const cloudinary = require('cloudinary').v2;

const cloudinaryConfig = {

  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,

  upload: {
    folder: 'grocery_app',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    max_file_size: 5 * 1024 * 1024, 
  },

  transformations: {
    thumbnail: {
      width: 200,
      height: 200,
      crop: 'fill',
      quality: 'auto',
    },
    medium: {
      width: 500,
      height: 500,
      crop: 'fill',
      quality: 'auto',
    },
    large: {
      width: 1000,
      height: 1000,
      crop: 'fill',
      quality: 'auto',
    },
  },

  validation: {
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024, 
    minWidth: 100,
    minHeight: 100,
  },

  errorMessages: {
    noCredentials: 'Cloudinary credentials not configured',
    invalidFileType: 'Invalid file type. Only images are allowed.',
    fileSizeTooLarge: 'File size too large. Maximum size is 5MB.',
    uploadFailed: 'Upload failed. Please try again.',
    deleteFailed: 'Delete failed. Please try again.',
    networkError: 'Network error. Please check your connection.',
  },
};

cloudinary.config({
  cloud_name: cloudinaryConfig.cloudName,
  api_key: cloudinaryConfig.apiKey,
  api_secret: cloudinaryConfig.apiSecret,
});

const validateFile = (file) => {
  if (!file) {
    return { valid: false, message: cloudinaryConfig.errorMessages.invalidFileType };
  }

  if (!cloudinaryConfig.validation.allowedMimeTypes.includes(file.mimetype)) {
    return { valid: false, message: cloudinaryConfig.errorMessages.invalidFileType };
  }

  if (file.size > cloudinaryConfig.validation.maxFileSize) {
    return { valid: false, message: cloudinaryConfig.errorMessages.fileSizeTooLarge };
  }

  return { valid: true };
};

const getUploadUrl = () => {
  if (!cloudinaryConfig.cloudName) {
    throw new Error(cloudinaryConfig.errorMessages.noCredentials);
  }

  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
};

const getCloudinaryUrl = (publicId, transformation = null) => {
  if (!cloudinaryConfig.cloudName) {
    throw new Error(cloudinaryConfig.errorMessages.noCredentials);
  }

  let baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;

  if (transformation) {
    if (typeof transformation === 'string') {
      baseUrl += `/${transformation}`;
    } else if (transformation.width || transformation.height) {
      const parts = [];
      if (transformation.width) parts.push(`w_${transformation.width}`);
      if (transformation.height) parts.push(`h_${transformation.height}`);
      if (transformation.crop) parts.push(`c_${transformation.crop}`);
      if (transformation.quality) parts.push(`q_${transformation.quality}`);

      if (parts.length > 0) {
        baseUrl += `/${parts.join(',')}`;
      }
    }
  }

  return `${baseUrl}/${publicId}`;
};

module.exports = {
  cloudinary,
  cloudinaryConfig,
  validateFile,
  getUploadUrl,
  getCloudinaryUrl,
};
