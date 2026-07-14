"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      style={{
        background: "none",
        border: "none",
        color: "var(--muted-foreground)",
        cursor: "pointer",
        fontSize: "var(--font-size-sm)",
        fontFamily: "var(--font-mono)",
        padding: "0",
        marginBottom: "1.5rem",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.color = "var(--muted-foreground)")
      }
      aria-label="Back to posts"
    >
      ← posts
    </button>
  );
}
