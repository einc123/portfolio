"use client";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en-GB">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#0c100e",
          color: "#e4ebe7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "28rem" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              opacity: 0.55,
            }}
          >
            Error
          </p>
          <h1
            style={{
              margin: "1rem 0 0",
              fontSize: "2.25rem",
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: 1,
            }}
          >
            Something went wrong.
          </h1>
          <p style={{ margin: "1rem 0 0", opacity: 0.7, lineHeight: 1.5 }}>
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              marginTop: "1.75rem",
              border: 0,
              background: "#5fbfa8",
              color: "#0a0e0c",
              padding: "0.85rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
