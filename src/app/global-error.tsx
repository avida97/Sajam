"use client";

// Greška u samom okviru sajta (nav bar, footer): jednostavna stranica sa opisom greške.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="sr">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "100px 20px" }}>
        <h1 style={{ fontSize: 28, fontStyle: "italic", fontWeight: 500 }}>Nešto nije u redu</h1>
        <p style={{ fontSize: 14, color: "#52525b" }}>Stranica nije mogla da se prikaže. Pokušaj ponovo.</p>
        <button
          type="button"
          onClick={reset}
          style={{ marginTop: 24, height: 33, padding: "0 19px", background: "#0a0a0a", color: "#fff", border: 0, fontSize: 11, fontWeight: 700 }}
        >
          POKUŠAJ PONOVO
        </button>
        <p style={{ marginTop: 40, fontSize: 11, color: "#9a9a9a", wordBreak: "break-all" }}>
          {error.message}
          {error.digest ? ` (${error.digest})` : ""}
        </p>
      </body>
    </html>
  );
}
