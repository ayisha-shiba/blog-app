
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  createBlog,
  getBlogById,
  updateBlog,
} from "../services/blogService";

export default function BlogForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadBlog() {
      try {
        const blog = await getBlogById(id);

        if (cancelled) return;

        if (!blog || blog.authorId !== user?.uid) {
          setError("Blog not found or access denied.");
          return;
        }

        setTitle(blog.title);
        setContent(blog.content);
      } catch (error) {
        console.error(error);
        if (!cancelled) setError("Failed to load blog.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBlog();

    return () => {
      cancelled = true;
    };
  }, [id, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    if (!user) {
      setError("Please log in before saving a blog.");
      return;
    }

    setSaving(true);

    try {
      if (id) {
        await updateBlog(id, {
          title: title.trim(),
          content: content.trim(),
        });
      } else {
        await createBlog({
          title: title.trim(),
          content: content.trim(),
          authorId: user.uid,
          authorEmail: user.email,
        });
      }

      navigate("/blogs", { replace: true });
    } catch (error) {
      console.error(error);
      setError("Failed to save blog. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading blog...</p>;

  return (
    <main>
      <h1>{id ? "Edit Blog" : "Add New Blog"}</h1>

      {error && <p role="alert">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          required
        />

        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={10000}
          rows={10}
          required
        />

        <button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : id
              ? "Update Blog"
              : "Publish Blog"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/blogs")}
        >
          Cancel
        </button>
      </form>
    </main>
  );
}
