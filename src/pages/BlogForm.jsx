
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createBlog,
  getBlogById,
  updateBlog,
} from "../services/blogService";
import "../App.css";

export default function BlogForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submissionLock = useRef(false);

  useEffect(() => {
    if (!id || !user?.uid) return;
    let cancelled = false;
    async function loadBlog() {
      try {
        const blog = await getBlogById(id);
        if (cancelled) return;

        if (!blog || blog.authorId !== user.uid) {
          setError("Blog not found or access denied.");
          return;
        }
        setTitle(blog.title);
        setContent(blog.content);
      } catch (err) {
        console.error("Load blog error:", err);

        if (!cancelled) {
          setError("Unable to load this blog. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBlog();

    return () => {
      cancelled = true;
    };
  }, [id, user?.uid]);

  function handleTitleChange(event) {
    setTitle(event.target.value);
    setError("");
  }

  function handleContentChange(event) {
    setContent(event.target.value);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submissionLock.current || saving) return;

    if (!user) {
      setError("Please log in before saving a blog.");
      return;
    }

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle) {
      setError("Title is required.");
      return;
    }

    if (cleanTitle.length < 3) {
      setError("Title must contain at least 3 characters.");
      return;
    }

    if (cleanTitle.length > 120) {
      setError("Title cannot exceed 120 characters.");
      return;
    }

    // Content validation.
    if (!cleanContent) {
      setError("Content is required.");
      return;
    }

    if (cleanContent.length < 10) {
      setError("Content must contain at least 10 characters.");
      return;
    }

    if (cleanContent.length > 10000) {
      setError("Content cannot exceed 10,000 characters.");
      return;
    }

    submissionLock.current = true;
    setSaving(true);
    setError("");

    try {
      if (id) {
        await updateBlog(id, {
          title: cleanTitle,
          content: cleanContent,
        });
      } else {
        await createBlog({
          title: cleanTitle,
          content: cleanContent,
          authorId: user.uid,
          authorEmail: user.email,
        });
      }

      navigate("/blogs", {
        replace: true,
        state: {
          toast: id
            ? "Blog updated successfully!"
            : "Blog created successfully!",
        },
      });
    } catch (err) {
      console.error("Save blog error:", err);

      const message = err?.message || "";
      const normalizedMessage = message.toLowerCase();

      if (
        normalizedMessage.includes("already have a blog with this title") ||
        normalizedMessage.includes("another blog with this title")
      ) {
        setError(
          "A blog with this title already exists. Please choose a different title."
        );
      } else {
        setError(
          message || "Unable to save your blog. Please try again."
        );
      }
    } finally {
      submissionLock.current = false;
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="blog-form-page">
        <p className="loading-message">
          Loading your story...
        </p>
      </main>
    );
  }

  return (
    <main className="blog-form-page">
      <nav className="blog-form-nav">
        <Link to="/blogs" className="brand">
          <span className="brand-mark">s</span>
          

        </Link>

        <Link to="/blogs" className="back-link">
          ← Back to stories
        </Link>
      </nav>

      <section className="editor-heading">
        <p className="eyebrow">
          {id ? "REFINE YOUR THOUGHTS" : "A NEW JOURNAL ENTRY"}
        </p>

        <h1>
          {id ? "Edit your story" : "Put it into words."}
        </h1>

        <p>
          {id
            ? "Make your changes and save your story."
            : "Every great story starts with a single thought."}
        </p>
      </section>

      <form
        className="blog-editor"
        onSubmit={handleSubmit}
        noValidate
      >
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <div className="editor-field">
          <label htmlFor="title">Story title</label>

          <input
            id="title"
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Give your story a title..."
            minLength={3}
            maxLength={120}
            required
            aria-describedby="title-hint"
          />

          <div className="field-hint" id="title-hint">
            <span>3–120 characters</span>
            <span>{title.length}/120</span>
          </div>
        </div>

        <div className="editor-field">
          <label htmlFor="content">Your story</label>

          <textarea
            id="content"
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing here..."
            minLength={10}
            maxLength={10000}
            rows={12}
            required
            aria-describedby="content-hint"
          />

          <div className="field-hint" id="content-hint">
            <span>10–10,000 characters</span>
            <span>{content.length}/10,000</span>
          </div>
        </div>

        <div className="editor-actions">
          <button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : id
                ? "Save changes"
                : "Publish story"}
          </button>

          <button
            type="button"
            className="button-secondary"
            disabled={saving}
            onClick={() => navigate("/blogs")}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
