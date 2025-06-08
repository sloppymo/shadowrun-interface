import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';

interface GeneratedImage {
  id: string;
  prompt: string;
  image_url: string;
  provider: string;
  status: string;
  created_at: string;
  is_favorite: boolean;
  tags: string[];
}

interface ImageGalleryProps {
  sessionId: string;
  isVisible: boolean;
  onClose: () => void;
}

interface Provider {
  name: string;
  available: boolean;
}

const API_BASE_URL = 'http://localhost:5000';

export default function ImageGallery({ sessionId, isVisible, onClose }: ImageGalleryProps) {
  const { user } = useUser();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('dalle');
  const [providers, setProviders] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'gallery'>('generate');
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && user && sessionId) {
      fetchImages();
      fetchProviders();
    }
  }, [isVisible, user, sessionId]);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/session/${sessionId}/images?user_id=${user?.id}&limit=20`
      );
      setImages(response.data.images || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/session/${sessionId}/image-providers`
      );
      setProviders(response.data.providers || []);
      if (response.data.default) {
        setSelectedProvider(response.data.default);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim() || !user) return;

    try {
      setIsGenerating(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/session/${sessionId}/generate-image-instant`,
        {
          user_id: user.id,
          prompt: prompt.trim(),
          provider: selectedProvider,
          style_preferences: {
            quality: 'standard',
            size: '1024x1024'
          }
        }
      );

      // Add the new image to the gallery
      const newImage: GeneratedImage = {
        id: response.data.image_id,
        prompt: prompt.trim(),
        image_url: response.data.image_url,
        provider: response.data.provider,
        status: 'completed',
        created_at: new Date().toISOString(),
        is_favorite: false,
        tags: []
      };

      setImages(prev => [newImage, ...prev]);
      setPrompt('');
      setActiveTab('gallery');
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleFavorite = async (imageId: string, currentFavorite: boolean) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/session/${sessionId}/image/${imageId}/favorite`,
        {
          user_id: user?.id,
          is_favorite: !currentFavorite
        }
      );

      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, is_favorite: !currentFavorite } : img
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateImage();
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const openModal = (image: GeneratedImage) => {
    setSelectedImage(image);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-11/12 max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-green-400">Scene Visualizer</h2>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  activeTab === 'generate' 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Generate
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  activeTab === 'gallery' 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Gallery ({images.length})
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'generate' ? (
            <div className="p-6 h-full flex flex-col">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Scene Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe the scene you want to visualize... (e.g., 'A rain-soaked Seattle street with neon signs and corporate towers in the background')"
                  className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-green-500 resize-none"
                  disabled={isGenerating}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Provider
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-green-500"
                  disabled={isGenerating}
                >
                  {providers.map(provider => (
                    <option key={provider} value={provider}>
                      {provider === 'dalle' ? 'DALL-E 3' : provider === 'stability' ? 'Stable Diffusion' : provider}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={!prompt.trim() || isGenerating || providers.length === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  'Generate Scene Image'
                )}
              </button>

              {providers.length === 0 && (
                <div className="mt-4 p-4 bg-yellow-800 border border-yellow-600 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    No image generation providers are configured. Please ensure OpenAI or Stability AI API keys are set up.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 h-full overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <svg className="animate-spin h-8 w-8 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p>No images generated yet.</p>
                  <p className="text-sm mt-2">Switch to the Generate tab to create your first scene visualization.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map(image => (
                    <div key={image.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
                      <div className="relative group cursor-pointer" onClick={() => openModal(image)}>
                        <img
                          src={image.image_url}
                          alt={image.prompt}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-gray-300 text-sm line-clamp-2 mb-2">{image.prompt}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 uppercase">{image.provider}</span>
                          <button
                            onClick={() => handleToggleFavorite(image.id, image.is_favorite)}
                            className={`text-sm transition-colors ${
                              image.is_favorite ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'
                            }`}
                          >
                            ★
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for full-size image */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60"
          onClick={closeModal}
        >
          <div 
            className="max-w-4xl max-h-full m-4 bg-gray-900 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.prompt}
                className="max-w-full max-h-[80vh] object-contain"
              />
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 border-t border-gray-700">
              <p className="text-gray-300 mb-2">{selectedImage.prompt}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{selectedImage.provider.toUpperCase()}</span>
                <span>{new Date(selectedImage.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 