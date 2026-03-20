import React, { useState } from 'react';
import CloudinaryUpload from './CloudinaryUpload';

const UploadExample = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [singleImage, setSingleImage] = useState(null);

  const handleSingleUpload = (data) => {
    console.log('Single upload success:', data);
    setSingleImage(data.data);
    alert('Single image uploaded successfully!');
  };

  const handleMultipleUpload = (data) => {
    console.log('Multiple upload success:', data);
    setUploadedImages(prev => [...prev, ...data.data]);
    alert(`${data.data.length} images uploaded successfully!`);
  };

  const handleUploadError = (error) => {
    console.error('Upload error:', error);
    alert(`Upload failed: ${error}`);
  };

  const removeSingleImage = () => {
    setSingleImage(null);
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Cloudinary Upload Examples</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Single Image Upload</h3>
          </div>
          <div className="p-6 space-y-4">
            <CloudinaryUpload
              multiple={false}
              onUploadSuccess={handleSingleUpload}
              onUploadError={handleUploadError}
              maxSize={5}
            >
              Upload your profile picture
            </CloudinaryUpload>

            {}
            {singleImage && (
              <div className="mt-4 space-y-2">
                <div className="relative">
                  <img
                    src={singleImage.secure_url}
                    alt="Uploaded"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                    onClick={removeSingleImage}
                  >
                    <span className="text-xs">×</span>
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  <p>File: {singleImage.original_filename || 'Unknown'}</p>
                  <p>Size: {(singleImage.bytes / 1024).toFixed(2)} KB</p>
                  <p>Dimensions: {singleImage.width}x{singleImage.height}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Multiple Images Upload</h3>
          </div>
          <div className="p-6 space-y-4">
            <CloudinaryUpload
              multiple={true}
              onUploadSuccess={handleMultipleUpload}
              onUploadError={handleUploadError}
              maxSize={5}
            >
              Upload multiple product images
            </CloudinaryUpload>

            {}
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Uploaded Images ({uploadedImages.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.secure_url}
                        alt={`Uploaded ${index}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <span className="text-xs">×</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Usage Information</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Backend API Endpoints:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">POST /api/upload/single</code> - Upload single file</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">POST /api/upload/multiple</code> - Upload multiple files</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">DELETE /api/upload/:publicId</code> - Delete file</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Frontend Components:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">useCloudinaryUpload</code> - Hook for upload functionality</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">CloudinaryUpload</code> - Upload component with drag & drop</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>JWT authentication required</li>
                <li>File type validation (images only)</li>
                <li>File size validation (5MB limit)</li>
                <li>Drag and drop support</li>
                <li>Upload progress indication</li>
                <li>Error handling and user feedback</li>
                <li>Cloudinary automatic optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadExample;
