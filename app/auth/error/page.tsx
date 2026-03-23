export default function AuthErrorPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        fontFamily: 'Georgia, "Times New Roman", serif'
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          padding: "28px",
          borderRadius: "24px",
          background: "rgba(255,255,255,0.88)",
          border: "1px solid rgba(30,27,22,0.08)"
        }}
      >
        <h1>Auth link issue</h1>
        <p>
          Your confirmation link could not be verified. Try signing up again, or request a fresh
          confirmation email from Supabase Auth.
        </p>
      </div>
    </main>
  );
}
