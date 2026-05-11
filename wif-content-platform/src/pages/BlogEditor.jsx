import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import PostEditor from "../components/PostEditor";
import SEOPanel from "../components/SEOPanel";
import MediaUploader from "../components/MediaUploader";
import Preview from "../components/Preview";

export default function BlogEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = !!slug;
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get("mode") || "editor"; // editor | seo | media | preview

  const [post, setPost] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    status: "draft",
    type: "blog",
    date: new Date().toISOString().split("T")[0],
    author: "WIF Marketing",
    image: "",
    image_alt: "",
    og_title: "",
    og_description: "",
    tags: [],
    faqs: [{ question: "", answer: "" }],
    metrics: [{ label: "", value: "" }],
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState(mode);

  const contentRef = useRef(null);

  useEffect(() => {
    if (isEdit) {
      loadPost();
    }
  }, [slug]);

  async function loadPost() {
    try {
      const data = await api.get(`content/blog/${slug}`);
      if (data) {
        setPost((prev) => ({
          ...prev,
          ...data,
          content: data.content || data.body || "",
        }));
      }
    } catch (err) {
      console.error("Failed to load post:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDraft() {
    setSaving(true);
    try {
      const payload = { ...post, status: "draft" };
      const result = await api.post("content/save-draft", payload);
      setSaved(true);
      if (result.slug && !post.slug) {
        setPost((p) => ({ ...p, slug: result.slug }));
        navigate(`/blog/${result.slug}?mode=editor`);
      }
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save draft:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      // First save as draft, then open PR
      const saveResult = await api.post("content/save-draft", {
        ...post,
        status: "published",
      });
      const prResult = await api.post("content/open-pr", {
        slug: saveResult.slug || post.slug,
        collection: "blog",
        title: post.title,
      });
      setPost((p) => ({ ...p, status: "published" }));
    } catch (err) {
      console.error("Failed to publish:", err);
    } finally {
      setPublishing(false);
    }
  }

  function handleImageUpload(url) {
    if (url) {
      const input = contentRef.current;
      if (input) {
        const pos = input.selectionStart || 0;
        const newContent =
          post.content.substring(0, pos) + `![alt text](${url})` + post.content.substring(pos);
        setPost((p) => ({ ...p, content: newContent }));
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Edit Blog Post" : "New Blog Post"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit ? post.title : "Create a new blog post"}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("editor")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "editor"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "preview"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab("seo")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "seo"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          SEO
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "media"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          Media
        </button>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {activeTab === "editor" && (
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={post.title}
                onChange={(e) => setPost((p) => ({ ...p, title: e.target.value }))}
                placeholder="Enter post title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                value={post.slug}
                onChange={(e) =>
                  setPost((p) => ({
                    ...p,
                    slug: e.target.value.replace(/\s+/g, "-").toLowerCase(),
                  }))
                }
                placeholder="kebab-case-slug"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={post.description}
                onChange={(e) =>
                  setPost((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                placeholder="Brief summary for SEO and social sharing"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body (Markdown) *
              </label>
              <textarea
                ref={contentRef}
                value={post.content}
                onChange={(e) => setPost((p) => ({ ...p, content: e.target.value }))}
                rows={15}
                placeholder="# Heading&#10;&#10;Write your content in **Markdown**..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={post.status === "draft"}
                    onChange={(e) =>
                      setPost((p) => ({ ...p, status: e.target.value }))
                    }
                  />
                  Draft
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={post.status === "published"}
                    onChange={(e) =>
                      setPost((p) => ({ ...p, status: e.target.value }))
                    }
                  />
                  Published
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium transition-colors"
                >
                  {saving ? "Saving..." : saved ? "✓ Saved" : "Save Draft"}
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition-colors"
                >
                  {publishing ? "Publishing..." : "Publish"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <Preview post={post} />
        )}

        {activeTab === "seo" && (
          <SEOPanel post={post} onUpdate={(updates) => setPost((p) => ({ ...p, ...updates }))} />
        )}

        {activeTab === "media" && (
          <MediaUploader
            onUpload={(url) => handleImageUpload(url)}
            currentImage={post.image}
            onSelectImage={(url) => setPost((p) => ({ ...p, image: url }))}
          />
        )}
      </div>
    </div>
  );
}