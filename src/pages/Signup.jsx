import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSignup(event) {
    event.preventDefault();
    setError("");

    if (loading) return;

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Email is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (password.length > 45) {
      setError("Password cannot exceed 45 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain an uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain a lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain a number.");
      return;
    }

    if (!/[^A-Za-z0-9\s]/.test(password)) {
      setError("Password must contain a special character.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, cleanEmail, password);

      navigate("/blogs", { replace: true });
    } catch (err) {
      console.error("Signup error:", err.code, err.message);

      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Please choose a stronger password.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Check your internet connection.");
      } else {
        setError("Unable to create your account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  
  function EyeIcon({ visible }) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {visible ? (
          <>
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 002.8 2.8" />
            <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.1-2.2 3.1" />
            <path d="M6.2 6.2C3.9 7.7 2.7 9.9 2.5 12c1 2.5 4.5 7 9.5 7 1.1 0 2.1-.2 3-.6" />
          </>
        ) : (
          <>
            <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
            <circle cx="12" cy="12" r="3" />
          </>
        )}
      </svg>
    );
  }

  return (
    <main>
      <h1>Create an account</h1>

      <form onSubmit={handleSignup}>
        <label htmlFor="email">Email</label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>

        <div className="password-input-wrapper">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((previous) => !previous)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            <EyeIcon visible={showPassword} />
          </button>
        </div>

        <label htmlFor="confirmPassword">Confirm Password</label>

        <div className="password-input-wrapper">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword((previous) => !previous)}
            aria-label={
              showConfirmPassword
                ? "Hide confirmation password"
                : "Show confirmation password"
            }
            aria-pressed={showConfirmPassword}
          >
            <EyeIcon visible={showConfirmPassword} />
          </button>
        </div>

        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </main>
  );
}
