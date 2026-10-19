"use client";

/** Last-resort fallback if the root layout itself fails (no app styles available). */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#14123a", color: "#f7f5f0", fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <main style={{ textAlign: "center", padding: 24 }}>
          <h1>CityMate hit an unexpected error</h1>
          <p>Please try again in a moment.</p>
          <button onClick={reset} style={{ marginTop: 12, padding: "10px 20px", borderRadius: 999, border: 0, background: "#3df2c2", fontWeight: 700 }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
