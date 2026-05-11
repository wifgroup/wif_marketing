import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Blog from "./pages/Blog";
import BlogEditor from "./pages/BlogEditor";
import CaseStudies from "./pages/CaseStudies";
import CaseStudyEditor from "./pages/CaseStudyEditor";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/new" element={<BlogEditor />} />
          <Route path="blog/:slug" element={<BlogEditor />} />
          <Route path="case-studies" element={<CaseStudies />} />
          <Route path="case-studies/new" element={<CaseStudyEditor />} />
          <Route path="case-studies/:slug" element={<CaseStudyEditor />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;