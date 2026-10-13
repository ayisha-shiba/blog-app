
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import BlogList from "./pages/BlogList";
import BlogForm from "./pages/BlogForm";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Checking authentication...</p>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={user ? "/blogs" : "/signup"}
            replace
          />
        }
      />

      <Route
        path="/signup"
        element={
          user ? <Navigate to="/blogs" replace /> : <Signup />
        }
      />

      <Route
        path="/login"
        element={
          user ? <Navigate to="/blogs" replace /> : <Login />
        }
      />

      <Route
        path="/blogs"
        element={
          user ? <BlogList /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/blogs/new"
        element={
          user ? <BlogForm /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/blogs/edit/:id"
        element={
          user ? <BlogForm /> : <Navigate to="/login" replace />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
