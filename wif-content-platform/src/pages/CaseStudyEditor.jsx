import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import PostEditor from "../components/PostEditor";
import SEOPanel from "../components/SEOPanel";
import MediaUploader from "../components/MediaUploader";
import Preview from "../components/Preview";

export default function CaseStudyEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = !!slug;
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get("mode") || "editor";

  const [post, setPost] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    status: "draft",
    type: "case-studies",
    date: new Date().toISOString().split("T")[0],
    author: "WIF Marketing",
    image: "",
    image_alt: "",
    og_title: "",
    og_description: "",
    client: "",
    industry: "",
    result_headline: "",
    tags: [],
    faqs: [{ question: "", answer: "" }],
    metrics: [{ label: "", value: "" }],
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState(mode);

  const contentRef = React.useRef(null);

  useEffect(() => {
    if (isEdit) loadPost();
  }, [slug]);

  async function loadPost() {
    try {
      const data = await api.get(`content/case-studies/${slug}`);
      if (data) {
        setPost((prev) => ({
          ...prev,
          ...data,
          content: data.content || data.body || "",
        }));
      }
    } catch (err) {
      console.error("Failed to load case study:", err);
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
        navigate(`/case-studies/${result.slug}?mode=editor`);
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
      const saveResult = await api.post("content/save-draft", {
        ...post,
        status: "published",
      });
      await api.post("content/open-pr", {
        slug: saveResult.slug || post.slug,
        collection: "case-studies",
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
    if (url && contentRef.current) {
      const pos = contentRef.current.selectionStart || 0;
      const newContent =
        post.content.substring(0, pos) + `![alt text](${url})` + post.content.substring(pos);
      setPost((p) => ({ ...p, content: newContent }));
    }
  }

  function addField(field, value) {
    setPost((p) => ({ ...p, [field]: [...(p[field] || []), value] }));
  }

  function removeField(field, index) {
    setPost((p) => ({
      ...p,
      [field]: (p[field] || []).filter((_, i) => i !== index),
    }));
  }

  function updateField(field, index, key, value) {
    setPost((p) => {
      const items = [...(p[field] || [])];
      items[index] = { ...items[index], [key]: value };
      return { ...p, [field]: items };
    });
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Edit Case Study" : "New Case Study"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit ? post.title : "Create a new case study"}
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {["editor", "preview", "seo", "media"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {activeTab === "editor" && (
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={post.title}
                onChange={(e) => setPost((p) => ({ ...p, title: e.target.value }))}
                placeholder="Enter case study title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Case study specific fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={post.client || ""}
                  onChange={(e) => setPost((p) => ({ ...p, client: e.target.value }))}
                  placeholder="e.g. Bajaj Chetak"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  value={post.industry || ""}
                  onChange={(e) => setPost((p) => ({ ...p, industry: e.target.value }))}
                  placeholder="e.g. Electric Vehicles"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Result Headline
              </label>
              <input
                type="text"
                value={post.result_headline || ""}
                onChange={(e) =>
                  setPost((p) => ({ ...p, result_headline: e.target.value }))
                }
                placeholder="e.g. +150% qualified leads in 90 days"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={post.description}
                onChange={(e) => setPost((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="Brief summary"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Metrics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metrics / Results
              </label>
              {post.metrics.map((m, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={m.label}
                    onChange={(e) => updateField("metrics", i, "label", e.target.value)}
                    placeholder="Label (e.g. Leads Generated)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={m.value}
                    onChange={(e) => updateField("metrics", i, "value", e.target.value)}
                    placeholder="Value (e.g. 2,400+)"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => removeField("metrics", i)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => addField("metrics", { label: "", value: "" })}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                + Add metric
              </button>
            </div>

            {/* FAQs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                FAQs
              </label>
              {post.faqs.map((faq, i) => (
                <div key={i} className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateField("faqs", i, "question", e.target.value)}
                    placeholder="Question"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-indigo-500"
                  />
                  <textarea
                    value={faq.answer}
                    onChange={(e) => updateField("faqs", i, "answer", e.target.value)}
                    placeholder="Answer"
                    rows={2}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => removeField("faqs", i)}
                    className="text-sm text-red-500 hover:text-red-700 mt-1"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => addField("faqs", { question: "", answer: "" })}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                + Add FAQ
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body (Markdown) *
              </label>
              <textarea
                ref={contentRef}
                value={post.content}
                onChange={(e) => setPost((p) => ({ ...p, content: e.target.value }))}
                rows={15}
                placeholder="# Introduction&#10;&#10;Write the case study in **Markdown**..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="status-cs"
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
                    name="status-cs"
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

        {activeTab === "preview" && <Preview post={post} />}

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