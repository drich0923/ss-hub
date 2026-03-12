export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#050508", color: "#ccc", padding: "64px 24px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <a href="/" style={{ color: "#8ceb4c", fontSize: "13px", textDecoration: "none", marginBottom: "32px", display: "inline-block" }}>← Back to Portal</a>
        <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Privacy Policy</h1>
        <p style={{ color: "#555", fontSize: "13px", marginBottom: "40px" }}>Last updated: March 11, 2026</p>
        <div style={{ lineHeight: 1.8, fontSize: "14px" }}>
          <h2 style={{ fontSize: "18px", color: "#fff", margin: "32px 0 12px" }}>1. Introduction</h2>
          <p>Systemized Sales LLC ("we," "us," or "our") operates the Systemized Sales Internal Portal at app.systemizedsales.com. This Privacy Policy describes how we collect, use, and protect your information when you use our platform.</p>
          <h2 style={{ fontSize: "18px", color: "#fff", margin: "32px 0 12px" }}>2. Information We Collect</h2>
          <p><strong style={{ color: "#fff" }}>Account Information:</strong> When you sign in via Google OAuth, we receive your name, email address, and profile picture from your Google account.</p>
          <p><strong style={{ color: "#fff" }}>Calendar Data:</strong> If you grant calendar access, we read your Google Calendar events to display your schedule within the dashboard. We do not modify, create, or delete calendar events.</p>
          <p><strong style={{ color: "#fff" }}>Usage Data:</strong> We may collect information about how you interact with the platform, including pages visited, features used, and bookmarks saved.</p>
          <h2 style={{ fontSize: "18px", color: "#fff", margin: "32px 0 12px" }}>3. How We Use Your Information</h2>
          <p>We use your information solely to:</p>
          <ul style={{ paddingLeft: "20px" }}><li>Authenticate your identity and provide access to the portal</li><li>Display your personalized dashboard, including calendar events and bookmarked pages</li><li>Improve the platform experience</li></ul>
          <p>We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
          <h2 style={{ fontSize: "18px", color: "#fff", margin: "32px 0 12px" }}>4. Data Storage and Security</h2>
          <p>Your data is stored securely using Supabase (hosted on AWS) with encryption at rest and in transit. Authentication tokens are stored in secure, HTTP-only cookies. We implement industry-standard security measures to protect your information.</p>
          <h2 style={{ fontSize: "18px", color: "#fff", margin: "32px 0 12px" }}>5. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul style={{ paddingLeft: "20px" }}><li><strong style={{ color: "#fff" }}>Google OAuth</strong> — for authentication</li><li><strong style={{ color: "#fff" }}>Google Calendar API</strong> — to display your schedule (read-only)</li><li><strong style={{ color: "#fff" }}>Supabase</strong> — for data storage and authentication</li><li><strong style={{ color: "#fff" }}>Vercel</strong> — for hosting</li></ul>
          <h2 style={{ fontSize: "18px", color: "#fff", margin: "32px 0 12px" }}>6. Your Rights</h2>
          <p>You may:</p>
          <ul style={{ paddingLeft: "20px" }}><li>Revoke Google Calendar access at any time via your Google Account settings</li><li>Request deletion of your account and associated data</li><li>Request a copy of your stored data</li></ul>
          <h2 style={{ fontSize: "18px", color: "#fff", margin: "32px 0 12px" }}>7. Data Retention</h2>
          <p>We retain your data for as long as your account is active. Upon account deletion or termination of your relationship with Systemized Sales, your data will be removed within 30 days.</p>
          <h2 style={{ fontSize: "18px", color: "#fff", margin: "32px 0 12px" }}>8. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on this page.</p>
          <h2 style={{ fontSize: "18px", color: "#fff", margin: "32px 0 12px" }}>9. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, contact us at:</p>
          <p style={{ color: "#fff" }}>Systemized Sales LLC<br />Email: support@systemizedsales.com</p>
        </div>
      </div>
    </div>
  );
}
