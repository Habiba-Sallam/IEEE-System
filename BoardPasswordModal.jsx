import { useState } from "react";
import { BOARD_ACCESS_PASSWORD } from "../../config";

/**
 * Clean modal that asks for the board password before granting access.
 * Used from the Login page and from the Topbar's "Preview as Board" switch
 * so there's exactly one path into the Board Dashboard, and it's gated.
 */
export default function BoardPasswordModal({ open, onSuccess, onCancel }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (password === BOARD_ACCESS_PASSWORD) {
      setPassword("");
      setError("");
      onSuccess();
    } else {
      setError("Incorrect password. Ask a board lead for access.");
    }
  }

  function handleCancel() {
    setPassword("");
    setError("");
    onCancel();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(6,9,18,0.7)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
    >
      <form
        onSubmit={handleSubmit}
        className="panel"
        style={{ width: 340, textAlign: "left" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <h2 style={{ fontSize: 16, margin: 0 }}>Board Access</h2>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text-dim)", margin: "0 0 16px" }}>
          Enter the board password to continue.
        </p>

        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          placeholder="Password"
          style={{
            width: "100%", background: "var(--bg-panel-2)", border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
            color: "var(--text)", padding: "10px 12px", borderRadius: 8, fontSize: 13.5,
            marginBottom: error ? 8 : 16,
          }}
        />
        {error && (
          <p style={{ color: "var(--danger)", fontSize: 12, margin: "0 0 16px" }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }}>
            Unlock
          </button>
        </div>
      </form>
    </div>
  );
}
