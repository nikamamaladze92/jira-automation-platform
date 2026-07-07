import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f7f8fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "22px",
    fontWeight: 700,
    marginBottom: "6px",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "28px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
    color: "#1a1a1a",
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    padding: "11px",
    fontSize: "14px",
    fontWeight: 600,
    backgroundColor: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  error: {
    backgroundColor: "#fff5f5",
    border: "1px solid #f3c2c2",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    color: "#c0392b",
    marginBottom: "16px",
  },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your account to continue.</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.fieldGroup}>
            <div>
              <label style={styles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={styles.input}
                required
              />
            </div>

            <div>
              <label style={styles.label} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                required
              />
            </div>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
