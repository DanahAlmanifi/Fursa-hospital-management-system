import { NavLink, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

const NAV = [
    {
        to: "/dashboard",
        label: "Dashboard",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
    },
    {
        to: "/patients",
        label: "Patients",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
]

export default function Sidebar() {
    const navigate = useNavigate()

    async function handleSignOut() {
        await supabase.auth.signOut()
        navigate("/login", { replace: true })
    }

    return (
        <aside className="sidebar">
            {/* Logo / Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <img src="/fursa.logo.png" alt="Fursa Logo" />
                </div>
                <div className="sidebar-brand-text">
                    <span className="sidebar-brand-name">Fursa | فرصة</span>
                    <span className="sidebar-brand-sub">Hospital System</span>
                </div>
            </div>

            {/* Navigation section */}
            <div className="sidebar-section-label">Main Menu</div>
            <nav className="sidebar-nav">
                {NAV.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            "sidebar-link" + (isActive ? " sidebar-link--active" : "")
                        }
                    >
                        <span className="sidebar-link-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Bottom sign-out */}
            <div className="sidebar-footer">
                <button className="sidebar-signout" onClick={handleSignOut}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
