import React, { useState } from "react";
import api from "../utils/api";

export default function MediaUploader({ onUpload, currentImage, onSelectImage }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  function validateFile(file) {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert("Only JPG, PNG, WebP, and GIF files are allowed.");
      return false;
    }
    if (file.size > maxSize) {
      alert("File size must be under 5MB.");
      return false;
    }
    return true;
  }

  async function handleUpload(file) {
    if (!validateFile(file)) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("collection", "blog");
    formData.append("slug", "upload");

    try {
      // Simulated upload — in production this goes to Cloudflare R2 via Pages Function
      const response = await api.post("upload-media", formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      });

      if (response?.url) {
        onUpload(response.url);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  function handleFileInput(e) {
    const file = e.target.files[0];
    if (file) handleUpload(file);
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) handleUpload(file);
        break;
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-sm font-semibold text-gray-700 uppercase">
        Media Library
      </h2>

      {/* Current featured image */}
      {currentImage && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-600 mb-2">Current featured image:</p>
          <img
            src={
              currentImage.startsWith("http")
                ? currentImage
                : `https://wifmarketing.co${currentImage}`
            }
            alt="Current"
            className="max-h-60 rounded-lg border border-gray-300"
            onError={(e) => {
              e.target.src =
                "https://wifmarketing.co/assets/image/wif_marketing.png";
            }}
          />
          <button
            onClick={() => onSelectImage("")}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Remove image
          </button>
        </div>
      )}

      {/* Upload area */}
      <div className="border-2 border-dashed rounded-lg p-8 text-center transition-colors">
        {uploading ? (
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">Uploading... {progress}%</p>
          </div>
        ) : (
          <>
            <div
              className={`border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${
                dragOver
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onPaste={handlePaste}
              onClick={() =>
                document.getElementById("media-upload-input").click()
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  document
                    .getElementById("media-upload-input")
                    .click();
                }
              }}
            >
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-600">
                Click to upload, drag & drop, or paste an image
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WebP, GIF — max 5MB
              </p>
            </div>
            <input
              id="media-upload-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileInput}
            />
          </>
        )}
      </div>

      {/* Quick insert buttons */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Insert from URL
        </h4>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onUpload(e.target.value);
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector(
                '.MediaUploader input[type="url"]'
              );
              // Simpler approach: find sibling input
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}