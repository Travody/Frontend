'use client';

import { useState, useEffect } from 'react';
import { Upload, Image, Video, X, Plus, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface Step8MediaProps {
  data: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  isValid: boolean;
}

export default function Step8Media({ data, onSubmit, isLoading, isValid }: Step8MediaProps) {
  const [formData, setFormData] = useState({
    gallery: data.gallery || []
  });

  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setFormData({
      gallery: data.gallery || []
    });
  }, [data]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    try {
      // Simulate file upload - in real implementation, upload to your server
      const uploadedUrls = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          toast.error(`File ${file.name} is not a valid image or video`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is 10MB`);
          continue;
        }

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a mock URL - in real implementation, this would be the actual uploaded file URL
        const mockUrl = URL.createObjectURL(file);
        uploadedUrls.push({
          url: mockUrl,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          name: file.name,
          size: file.size
        });
      }

      handleInputChange('gallery', [...formData.gallery, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    handleInputChange('gallery', formData.gallery.filter((_: any, i: number) => i !== index));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Media Gallery</h2>
        <p className="text-gray-600">Add photos and videos to showcase your tour</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-teal-500 bg-teal-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-600" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop files here or click to upload
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Upload images and videos to showcase your tour
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileInput}
                  className="hidden"
                  disabled={uploading}
                />
                <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                  <Plus className="w-4 h-4 mr-2" />
                  Choose Files
                </span>
              </label>
            </div>

            <div className="text-xs text-gray-500">
              <p>Supported formats: JPG, PNG, GIF, MP4, MOV</p>
              <p>Maximum file size: 10MB per file</p>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-sm text-blue-700">Uploading files...</span>
            </div>
          </div>
        )}

        {/* Media Gallery */}
        {formData.gallery.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Media Gallery ({formData.gallery.length} files)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formData.gallery.map((media: any, index: number) => (
                <div key={index} className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={media.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                  </div>
                  
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {media.type === 'image' ? (
                          <Image className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Video className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {media.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(media.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Tips */}
        <div className="bg-yellow-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Tips</h3>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  <strong>High-quality images:</strong> Use clear, well-lit photos that showcase the best aspects of your tour.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  <strong>Variety:</strong> Include photos of different locations, activities, and moments from your tour.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  <strong>Video content:</strong> Short videos can help travelers visualize the experience better.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  <strong>First impression:</strong> The first image will be the main thumbnail, so choose your best photo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Step Notice */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Eye className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm text-blue-700">
              <strong>Note:</strong> This step is optional. You can add media later or skip to the next step.
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || uploading}
            className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Step'}
          </button>
        </div>
      </form>
    </div>
  );
}
