import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Preview({ post }) {
  const baseUrl = "https://wifmarketing.co";
  const canonical = baseUrl + "/" + (post.type === "blog" ? "blog" : "case-studies") + "/" + (post.slug || "preview");
  const schema = buildSchema(post, canonical);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase">
          Page Preview
        </h2>
        <span className="text-xs text-gray-400">
          Simulated rendered output
        </span>
      </div>

      {/* Opener preview card */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="bg-gray-900 text-white px-4 py-2 text-xs flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-2 text-gray-400 font-mono">wifmarketing.co/blog/{post.slug || "preview"}</span>
        </div>

        <div className="p-8">
          {post.image && (
            <div className="mb-6">
              <img
                src={post.image.startsWith("http") ? post.image : baseUrl + post.image}
                alt={post.image_alt || post.title}
                className="w-full max-h-80 object-cover rounded-lg"
                onError={(e) => { e.target.src = baseUrl + "/assets/image/wif_marketing.png"; }}
              />
            </div>
          )}

          <div className="flex items-center gap-3 mb-2 text-sm text-gray-500">
            <time>{post.formattedDate || post.date}</time>
            {post.author && <span>by {post.author}</span>}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {post.title || "Post Title"}
          </h1>

          {post.description && (
            <p className="text-lg text-gray-600 mb-6">{post.description}</p>
          )}

          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>{children}</code>
                  );
                },
                h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-8 mb-3 text-gray-900" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-800" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-3" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-3" {...props} />,
                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-indigo-500 pl-4 my-4 italic text-gray-600" {...props} />,
              }}
            >
              {post.content || "Preview content will appear here when you write in Markdown..."}
            </ReactMarkdown>
          </div>

          {post.faqs && post.faqs.some((f) => f.question) && (
            <section className="mt-10 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {post.faqs.filter((f) => f.question).map((faq, i) => (
                  <details key={i} className="bg-gray-50 rounded-lg p-4" open={i === 0}>
                    <summary className="font-medium text-gray-900 cursor-pointer">{faq.question}</summary>
                    <p className="mt-2 text-gray-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {post.metrics && post.metrics.some((m) => m.label) && (
            <section className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Results</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {post.metrics.filter((m) => m.label).map((m, i) => (
                  <div key={i} className="bg-indigo-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-indigo-600">{m.value}</p>
                    <p className="text-sm text-gray-600 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <details className="mt-6">
        <summary className="text-sm text-gray-500 cursor-pointer">View JSON-LD Structured Data</summary>
        <pre className="mt-2 p-4 bg-gray-900 text-green-300 rounded-lg overflow-x-auto text-xs font-mono">
          {JSON.stringify(schema, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function buildSchema(frontmatter, canonical) {
  const origin = canonical.split("/").slice(0, 3).join("/");
  const type = frontmatter.type === "blog" ? "BlogPosting" : "CreativeWork";
  const segments = canonical.split("/").filter(Boolean).slice(3);
  const graph = [
    { "@type": "Organization", "@id": origin + "/#organization", name: "WIF Marketing", url: origin + "/" },
    { "@type": "WebSite", "@id": origin + "/#website", url: origin + "/", name: "WIF Marketing" },
    {
      "@type": "WebPage", "@id": canonical + "#webpage", url: canonical,
      name: frontmatter.og_title || frontmatter.title,
      description: frontmatter.description,
    },
    {
      "@type": "BreadcrumbList", "@id": canonical + "#breadcrumbs",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: origin + "/" },
        { "@type": "ListItem", position: 2, name: segments[0] || "", item: origin + "/" + (segments[0] || "") + ".html" },
        { "@type": "ListItem", position: 3, name: frontmatter.title, item: canonical },
      ],
    },
  ];

  if (type === "BlogPosting") {
    graph.push({
      "@type": "BlogPosting",
      "mainEntityOfPage": { "@id": canonical + "#webpage" },
      headline: frontmatter.title,
      image: frontmatter.image ? [origin + frontmatter.image] : [origin + "/assets/image/wif_marketing.png"],
      datePublished: frontmatter.date,
      inLanguage: "en-IN",
    });
  }

  if (frontmatter.faqs && frontmatter.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage", "@id": canonical + "#faq",
      mainEntity: frontmatter.faqs.map((faq) => ({
        "@type": "Question", name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}