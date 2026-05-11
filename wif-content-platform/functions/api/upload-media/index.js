// Cloudflare Pages Function: POST /api/content/upload-media
// Uploads media to Cloudflare R2 (placeholder implementation)

import { corsHeaders, validateAccess } from "../../shared/auth";
import { uploadToR2 } from "../../shared/r2";

export async function onRequestPost(context) {
  const { request, env } = context;

  const authCheck = await validateAccess(request);
  if (authCheck) return authCheck;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const collection = formData.get("collection") || "blog";
    const slug = formData.get("slug") || "upload";

    if (!file || typeof file === "string") {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: corsHeaders() }
      );
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: "Only JPG, PNG, WebP, and GIF files are allowed" }),
        { status: 400, headers: corsHeaders() }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File size must be under 5MB" }),
        { status: 400, headers: corsHeaders() }
      );
    }

    const ext = file.name.split(".").pop();
    const key = "assets/image/content/" + collection + "/" + slug + "/" + Date.now() + "." + ext;
    const buffer = await file.arrayBuffer();

    const result = await uploadToR2(key, Buffer.from(buffer), file.type);

    if (result.success) {
      return new Response(
        JSON.stringify({
          success: true,
          url: result.url || "https://cdn.wifmarketing.co/" + key,
          key,
        }),
        { headers: corsHeaders() }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: result.error, key }),
        { headers: corsHeaders() }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Upload failed" }),
      { status: 500, headers: corsHeaders() }
    );
  }
}