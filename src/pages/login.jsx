import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

export default function LoginPage() {
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [sent, setSent] = useState(false)

    async function handleSendMagicLink(e) {
        e.preventDefault()
        setLoading(true)
        setError("")

        // Construct the full callback URL
        const callbackUrl = `${window.location.origin}/auth/callback`

        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
                emailRedirectTo: callbackUrl,
            },
        })

        setLoading(false)

        if (error) setError(error.message)
        else setSent(true)
    }

    return (
        <div className="login-root">
            {/* Left panel */}
            <div className="login-panel">
                <div className="login-card">
                    {/* Logo */}
                    <div className="login-logo">
                        <div className="login-logo-icon">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <div>
                            <div className="login-brand">Fursa</div>
                            <div className="login-brand-sub">Hospital Information System</div>
                        </div>
                    </div>

                    <div className="login-divider" />

                    {!sent ? (
                        <>
                            <h1 className="login-title">Sign in</h1>
                            <p className="login-desc">Enter your email to receive a secure magic link.</p>

                            <form onSubmit={handleSendMagicLink} className="login-form">
                                <div className="field-group">
                                    <label>Email address</label>
                                    <input
                                        placeholder="you@hospital.org"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="login-input"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="login-btn"
                                >
                                    {loading ? (
                                        <>
                                            <span className="btn-spinner" />
                                            Sending…
                                        </>
                                    ) : (
                                        <>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="22" y1="2" x2="11" y2="13" />
                                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                            Send Magic Link
                                        </>
                                    )}
                                </button>

                                {error && (
                                    <div className="login-error">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        {error}
                                    </div>
                                )}

                                <p className="login-hint">
                                    A sign-in link will be sent to your email. Open it on the same browser for best results.
                                </p>
                            </form>
                        </>
                    ) : (
                        <div className="login-sent">
                            <div className="sent-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <h2>Check your email</h2>
                            <p>We sent a magic link to <strong>{email}</strong>. Open it to sign in.</p>
                            <div className="sent-actions">
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => { setSent(false); setEmail(""); setError("") }}
                                >
                                    Use a different email
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right decorative panel */}
            <div className="login-aside">
                <div className="login-aside-content">
                    <div className="login-aside-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    <h2>Patient care, simplified.</h2>
                    <p>Fursa brings together patient records, appointments, and clinical data into one system.</p>
                    <div className="aside-features">
                        {["Patient Registry", "Appointment Scheduling", "Clinical Records", "Secure & Compliant"].map((f) => (
                            <div key={f} className="aside-feature">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {f}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        .login-root {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          margin: 0;
          padding: 0;
          position: absolute;
          top: 0;
          left: 0;
        }
        .login-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background: var(--bg-base);
        }
        .login-card {
          width: min(420px, 100%);
        }
        .login-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .login-logo-icon {
          width: 50px;
          height: 50px;
          background: var(--accent-dim);
          border: 1px solid var(--border-strong);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-light);
          flex-shrink: 0;
        }
        .login-brand {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }
        .login-brand-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 3px;
          letter-spacing: 0.04em;
        }
        .login-divider {
          height: 1px;
          background: var(--border);
          margin-bottom: 28px;
        }
        .login-title {
          font-size: 1.625rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .login-desc {
          color: var(--text-secondary);
          margin-bottom: 24px;
          font-size: 0.9rem;
        }
        .login-form { display: flex; flex-direction: column; gap: 14px; }
        .login-input {
          padding: 11px 14px;
          width: 100%;
          font-size: 0.9375rem;
        }
        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          background: var(--accent);
          color: #fff;
          font-size: 0.9375rem;
          font-weight: 700;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .login-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          box-shadow: 0 4px 16px rgba(99,102,241,.4);
        }
        .login-btn:disabled { opacity: .6; cursor: not-allowed; }
        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        .login-error {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 14px;
          background: var(--red-dim);
          color: var(--red);
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          border: 1px solid rgba(244,63,94,0.2);
        }
        .login-hint {
          font-size: 0.8125rem;
          color: var(--text-muted);
          text-align: center;
          margin: 0;
        }
        /* Sent state */
        .login-sent { text-align: center; }
        .sent-icon {
          width: 64px;
          height: 64px;
          background: var(--green-dim);
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--green);
          margin: 0 auto 16px;
        }
        .login-sent h2 { margin-bottom: 10px; }
        .login-sent p { color: var(--text-secondary); margin-bottom: 24px; font-size: 0.9rem; }
        .sent-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        /* Right panel */
        .login-aside {
          width: 420px;
          background: linear-gradient(160deg, #131629 0%, #1a1d40 50%, #131629 100%);
          border-left: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 48px;
        }
        @media (max-width: 768px) { .login-aside { display: none; } }
        .login-aside-content { color: var(--text-primary); }
        .login-aside-icon {
          width: 80px;
          height: 80px;
          background: var(--accent-dim);
          border: 1px solid var(--border-strong);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-light);
          margin-bottom: 28px;
        }
        .login-aside-content h2 { font-size: 1.5rem; margin-bottom: 12px; }
        .login-aside-content p { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.7; margin-bottom: 28px; }
        .aside-features { display: flex; flex-direction: column; gap: 10px; }
        .aside-feature {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        .aside-feature svg { color: var(--green); flex-shrink: 0; }
      `}</style>
        </div>
    )
}