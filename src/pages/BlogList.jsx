import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { getBlogs, deleteBlog } from "../services/blogService";
import "../App.css";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;

    let cancelled = false;

    async function loadBlogs() {
      setLoading(true);
      setError("");

      try {
        const data = await getBlogs(user.uid);
        if (!cancelled) setBlogs(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Couldn't load your blogs. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBlogs();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      await deleteBlog(id);
      setBlogs((previous) => previous.filter((blog) => blog.id !== id));
    } catch (err) {
      console.error(err);
      setError("Couldn't delete this blog. Please try again.");
    }
  }

  
  async function handleLogout(){
      const confirmed = window.confirm("Are you sure you want to log out?");
      if(!confirmed) return;
      
      try{
        await signOut(auth);
        navigate("/login", {replace: true});

      }catch(err){
        console.log(err);
        setError("Couldn't log out. Please try again.")
      }
   }
  if (loading) {
    return (
      <main className="blog-dashboard">
        <p className="loading-message">Gathering your stories...</p>
      </main>
    );
  }

  return (
    <main className="blog-dashboard">
      <nav className="blog-navbar">
        <Link to="/blogs" className="brand">
          <span className="brand-mark">q.</span>
          quietpages
        </Link>

        <div className="nav-actions">
          <span className="user-email">{user?.email}</span>
          <button className="button-secondary" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>

      <section className="dashboard-intro">
        <p className="eyebrow">YOUR PERSONAL WRITING SPACE</p>
        <h1>A home for your thoughts.</h1>
        <p className="intro-description">
          Collect your ideas, share your stories, and make room for the things
          worth writing about.
        </p>

        <Link to="/blogs/new" className="button-primary">
          <span aria-hidden="true">＋</span> Write a story
        </Link>
      </section>

      <section className="stories-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR COLLECTION</p>
            <h2>Your stories</h2>
          </div>
          <span className="story-count">
            {blogs.length} {blogs.length === 1 ? "story" : "stories"}
          </span>
        </div>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {blogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">
              ✎
            </div>
            <h3>Your first story starts here.</h3>
            <p>You haven't written anything yet. Start with an idea.</p>
            <Link to="/blogs/new" className="button-primary">
              Write your first story
            </Link>
          </div>
        ) : (
          <div className="stories-grid">
            {blogs.map((blog) => (
              <article className="story-card" key={blog.id}>
                <div className="story-card-top">
                  <span className="story-label">JOURNAL ENTRY</span>
                  <span className="story-dot" aria-hidden="true">
                    ✳
                  </span>
                </div>

                <h3>{blog.title}</h3>

                <p className="story-excerpt">{blog.content}</p>

                <div className="story-footer">
                  <span className="story-author">
                    {blog.authorEmail || user?.email}
                  </span>

                  {blog.authorId === user?.uid && (
                    <div className="story-actions">
                      <button
                        className="text-button"
                        onClick={() => navigate(`/blogs/edit/${blog.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-button delete-button"
                        onClick={() => handleDelete(blog.id)}
                      >
                        Delete
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
        <span>quietpages</span>
        <span>A little space for your thoughts.</span>
      </footer>
    </main>
  );
}
