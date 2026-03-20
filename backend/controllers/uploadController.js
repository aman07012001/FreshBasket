const { cloudinary, cloudinaryConfig } = require('../config/cloudinary');
const { errorHandler } = require('../utils/errorHandler');

const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: cloudinaryConfig.errorMessages.uploadFailed,
        error: 'No file provided',
      });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: cloudinaryConfig.errorMessages.invalidFileType,
        error: 'Invalid file type',
      });
    }

    if (req.file.size > cloudinaryConfig.validation.maxFileSize) {
      return res.status(400).json({
        success: false,
        message: cloudinaryConfig.errorMessages.fileSizeTooLarge,
        error: 'File size too large',
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: cloudinaryConfig.upload.folder,
      use_filename: cloudinaryConfig.upload.use_filename,
      unique_filename: cloudinaryConfig.upload.unique_filename,
      overwrite: cloudinaryConfig.upload.overwrite,
      resource_type: cloudinaryConfig.upload.resource_type,
      allowed_formats: cloudinaryConfig.upload.allowed_formats,
      quality: 'auto',
      width: 1000,
      height: 1000,
      crop: 'limit',
    });

    const fs = require('fs');
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        resource_type: result.resource_type,
        created_at: new Date().toISOString(),
      },
      upload_time: Date.now(),
    });
  } catch (error) {
    console.error('Upload error:', error);

    let errorMessage = cloudinaryConfig.errorMessages.uploadFailed;
    let statusCode = 500;

    if (error.message.includes('File size') || error.message.includes('file size')) {
      errorMessage = cloudinaryConfig.errorMessages.fileSizeTooLarge;
      statusCode = 413; 
    } else if (error.message.includes('invalid') || error.message.includes('Invalid')) {
      errorMessage = cloudinaryConfig.errorMessages.invalidFileType;
      statusCode = 415; 
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      errorMessage = cloudinaryConfig.errorMessages.networkError;
      statusCode = 504; 
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: cloudinaryConfig.errorMessages.uploadFailed,
        error: 'No files provided',
      });
    }

    if (req.files.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.',
        error: 'Too many files',
      });
    }

    const validationErrors = [];
    req.files.forEach((file, index) => {
      if (!file.mimetype.startsWith('image/')) {
        validationErrors.push(`File ${index + 1}: ${cloudinaryConfig.errorMessages.invalidFileType}`);
      } else if (file.size > cloudinaryConfig.validation.maxFileSize) {
        validationErrors.push(`File ${index + 1}: ${cloudinaryConfig.errorMessages.fileSizeTooLarge}`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'File validation failed',
        errors: validationErrors,
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: cloudinaryConfig.upload.folder,
          use_filename: cloudinaryConfig.upload.use_filename,
          unique_filename: cloudinaryConfig.upload.unique_filename,
          overwrite: cloudinaryConfig.upload.overwrite,
          resource_type: cloudinaryConfig.upload.resource_type,
          quality: 'auto',
          width: 1000,
          height: 1000,
          crop: 'limit',
        });

        const fs = require('fs');
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        return {
          success: true,
          data: {
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
            resource_type: result.resource_type,
          },
        };
      } catch (uploadError) {
        return {
          success: false,
          error: uploadError.message,
          original_filename: file.originalname,
        };
      }
    });

    const results = await Promise.all(uploadPromises);

    const successfulUploads = results.filter(result => result.success);
    const failedUploads = results.filter(result => !result.success);

    const response = {
      success: successfulUploads.length > 0,
      message: successfulUploads.length > 0
        ? `Successfully uploaded ${successfulUploads.length} out of ${results.length} files`
        : 'All file uploads failed',
      data: successfulUploads.map(result => result.data),
      upload_statistics: {
        total_files: results.length,
        successful_uploads: successfulUploads.length,
        failed_uploads: failedUploads.length,
        success_rate: Math.round((successfulUploads.length / results.length) * 100),
      },
      upload_time: Date.now(),
    };

    if (failedUploads.length > 0) {
      response.failed_uploads = failedUploads;
    }

    const statusCode = successfulUploads.length > 0 ? 207 : 400; 
    res.status(statusCode).json(response);
  } catch (error) {
    console.error('Multiple upload error:', error);

    res.status(500).json({
      success: false,
      message: cloudinaryConfig.errorMessages.uploadFailed,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required for deletion',
        error: 'Missing public_id',
      });
    }

    if (typeof publicId !== 'string' || publicId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid public ID format',
        error: 'Invalid public_id',
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'File deleted successfully',
        public_id: publicId,
        deleted_at: new Date().toISOString(),
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found or already deleted',
        error: 'Resource not found',
        public_id: publicId,
      });
    }
  } catch (error) {
    console.error('Delete error:', error);

    let errorMessage = cloudinaryConfig.errorMessages.deleteFailed;
    let statusCode = 500;

    if (error.message.includes('not found') || error.message.includes('already')) {
      errorMessage = 'File not found or already deleted';
      statusCode = 404;
    } else if (error.message.includes('invalid') || error.message.includes('Invalid')) {
      errorMessage = 'Invalid public ID format';
      statusCode = 400;
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      errorMessage = cloudinaryConfig.errorMessages.networkError;
      statusCode = 504;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  deleteFile,
};
