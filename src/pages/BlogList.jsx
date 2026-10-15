
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { getBlogs, deleteBlog } from "../services/blogService";
import "../App.css";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const deletingIds = useRef(new Set());

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Display success toast after creating or editing a blog.
  useEffect(() => {
    const message = location.state?.toast;

    if (!message) return;

    setToast({
      message,
      type: "success",
    });

    // Clear navigation state to prevent repeated toasts.
    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.state, location.pathname, navigate]);

  // Automatically dismiss toast after 3 seconds.
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  function showToast(message, type = "success") {
    setToast({
      message,
      type,
    });
  }

  // Load blogs.
  useEffect(() => {
    if (!user?.uid) {
      setBlogs([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadBlogs() {
      setLoading(true);

      try {
        const data = await getBlogs(user.uid);

        if (!cancelled) {
          setBlogs(data);
        }
      } catch (err) {
        console.error("Load blogs error:", err);

        if (!cancelled) {
          showToast(
            "Couldn't load your blogs. Please try again.",
            "error"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBlogs();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  // Delete blog.
  async function handleDelete(id) {
    if (deletingIds.current.has(id)) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this blog?"
    );

    if (!confirmed) return;

    deletingIds.current.add(id);
    setDeletingId(id);

    try {
      await deleteBlog(id);

      setBlogs((previous) =>
        previous.filter((blog) => blog.id !== id)
      );

      showToast("Blog deleted successfully!");
    } catch (err) {
      console.error("Delete blog error:", err);

      showToast(
        "Couldn't delete this blog. Please try again.",
        "error"
      );
    } finally {
      deletingIds.current.delete(id);
      setDeletingId(null);
    }
  }

  // Logout.
  async function handleLogout() {
    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

    if (!confirmed) return;

    try {
      await signOut(auth);

      navigate("/login", {
        replace: true,
      });
    } catch (err) {
      console.error("Logout error:", err);

      showToast(
        "Couldn't log out. Please try again.",
        "error"
      );
    }
  }

  if (loading) {
    return (
      <main className="blog-dashboard">
        <p className="loading-message">
          Gathering your stories...
        </p>
      </main>
    );
  }

  return (
    <main className="blog-dashboard">
      {/* Toast notification */}
      {toast && (
        <div
          className={`toast toast-${toast.type}`}
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
        >
          <span className="toast-icon">
            {toast.type === "success" ? "✓" : "!"}
          </span>

          <span>{toast.message}</span>

          <button
            type="button"
            className="toast-close"
            onClick={() => setToast(null)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      <nav className="blog-navbar">
        <Link to="/blogs" className="brand">
          <span className="brand-mark">B</span>
          blog-app
        </Link>

        <div className="nav-actions">
          <span className="user-email">{user?.email}</span>

          <button
            className="button-secondary"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </nav>

      <section className="dashboard-intro">
        <p className="eyebrow">
          YOUR PERSONAL WRITING SPACE
        </p>

        <h1>Write new Blog</h1>

        <p className="intro-description">
          Collect your ideas, share your stories, and make
          room for the things worth writing about.
        </p>

        <Link to="/blogs/new" className="button-primary">
          <span aria-hidden="true">＋</span> Write a blog
        </Link>
      </section>

      <section className="stories-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR COLLECTION</p>
            <h2>Your stories</h2>
          </div>

          <span className="story-count">
            {blogs.length}{" "}
            {blogs.length === 1 ? "story" : "stories"}
          </span>
        </div>

        {blogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">
              ✎
            </div>

            <h3>Your first story starts here.</h3>

            <p>
              You haven't written anything yet.
              Start with an idea.
            </p>

            <Link
              to="/blogs/new"
              className="button-primary"
            >
              Write your first story
            </Link>
          </div>
        ) : (
          <div className="stories-grid">
            {blogs.map((blog) => (
              <article
                className="story-card"
                key={blog.id}
              >
                <div className="story-card-top">
                  <span className="story-label">
                    JOURNAL ENTRY
                  </span>

                  <span
                    className="story-dot"
                    aria-hidden="true"
                  >
                    ✳
                  </span>
                </div>

                <h3>{blog.title}</h3>

                <p className="story-excerpt">
                  {blog.content}
                </p>

                <div className="story-footer">
                  <span className="story-author">
                    {blog.authorEmail || user?.email}
                  </span>

                  {blog.authorId === user?.uid && (
                    <div className="story-actions">
                      <button
                        className="text-button"
                        onClick={() =>
                          navigate(`/blogs/edit/${blog.id}`)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="text-button delete-button"
                        disabled={deletingId === blog.id}
                        onClick={() => handleDelete(blog.id)}
                      >
                        {deletingId === blog.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="dashboard-footer">
        <span>shiba</span>
        <span>A little space for your thoughts.</span>
      </footer>
    </main>
  );
}
