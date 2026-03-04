import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"
import AppLayout from "../components/AppLayout"
import "./dashboard.css"

function StatCard({ label, value, icon, colorClass, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className={"stat-card-icon " + colorClass}>{icon}</div>
      </div>
      <div className="stat-card-value">{value}</div>
      {trend && <div className="stat-card-trend">{trend}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [userRole, setUserRole] = useState("user") // 'admin', 'doctor', or 'user'
  const [patientCount, setPatientCount] = useState("—")
  const [todayAppts, setTodayAppts] = useState([])
  const [apptsLoading, setApptsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      const { data: { session } } = await supabase.auth.getSession()
      const userEmail = session?.user?.email ?? ""
      setEmail(userEmail)

      // Role Check - Get from profiles table
      if (userEmail) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("email", userEmail)
          .single()

        if (profile?.role) setUserRole(profile.role)
      }

      // Fetch Total Patients
      supabase
        .from("patient")
        .select("patientid", { count: "exact", head: true })
        .then(({ count }) => {
          if (count !== null) setPatientCount(count)
        })

      // Fetch Today's Appointments
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, "0")
      const dd = String(now.getDate()).padStart(2, "0")
      const todayStr = `${yyyy}-${mm}-${dd}`

      const { data: appts } = await supabase
        .from("appointment")
        .select("*, patient!inner(fname, lname)")
        .eq("date", todayStr)
        .order("time", { ascending: true })

      if (appts) {
        setTodayAppts(appts)
      }
      setApptsLoading(false)
    }

    loadDashboard()
  }, [])

  const firstName = email ? email.split("@")[0] : "Doctor"

  return (
    <AppLayout>
      <div className="dashboard-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <p className="dashboard-greeting">Good morning, <strong>{firstName}</strong> 👋</p>
            <h1>Dashboard</h1>
          </div>
          <div className="header-meta">
            <span className="live-badge">
              <span className="live-dot" />
              Live
            </span>
            <span className="header-date">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="stats-grid">
          <StatCard
            label="Total Patients"
            value={patientCount}
            colorClass="icon-blue"
            trend="All registered patients"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <StatCard
            label="Departments"
            value="—"
            colorClass="icon-purple"
            trend="Coming soon"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            }
          />
          <StatCard
            label="Staff Online"
            value="—"
            colorClass="icon-amber"
            trend="Coming soon"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            }
          />
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 className="section-heading">Quick Actions</h2>
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => navigate("/patients")}>
              <span className="quick-icon icon-blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <div>
                <div className="quick-action-title">View Patients</div>
                <div className="quick-action-sub">Browse patient registry</div>
              </div>
            </button>
          </div>
        </div>

        {/* Today's Appointments Table */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="table-header">
            <h2 className="section-heading" style={{ margin: 0 }}>Today's Appointments</h2>
            <span className="badge badge-blue">{todayAppts.length} today</span>
          </div>

          {apptsLoading && (
            <div className="table-loading">
              <div className="spinner" />
              <span>Loading today's schedule…</span>
            </div>
          )}

          {!apptsLoading && todayAppts.length === 0 && (
            <div className="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <h3>No appointments today</h3>
              <p>Your schedule is clear for today.</p>
            </div>
          )}

          {!apptsLoading && todayAppts.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppts.map((appt) => (
                    <tr key={appt.appointmentid} onClick={() => navigate(`/patients/${appt.patientid}`)} style={{ cursor: "pointer" }}>
                      <td><strong>{appt.time}</strong></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div className="avatar-initial">{appt.patient?.fname?.[0] || "?"}</div>
                          <span>{appt.patient?.fname} {appt.patient?.lname}</span>
                        </div>
                      </td>
                      <td>{appt.type}</td>
                      <td>
                        <span className={`badge ${appt.status?.toLowerCase() === "completed" ? "badge-green"
                          : appt.status?.toLowerCase() === "cancelled" ? "badge-red"
                            : "badge-amber"
                          }`}>
                          ● {appt.status ?? "Scheduled"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System info card */}
        <div className="card" style={{ marginTop: 20 }}>
          <h2 className="section-heading">Session Info</h2>
          <div className="info-rows">
            <div className="info-row">
              <span className="info-key">Signed in as</span>
              <span className="info-val">{email || "—"}</span>
            </div>
            <div className="info-row">
              <span className="info-key">System</span>
              <span className="info-val">Fursa Hospital Information System</span>
            </div>
            <div className="info-row">
              <span className="info-key">Role Access</span>
              <span className={`badge ${userRole === "doctor" ? "badge-purple" : "badge-blue"}`}>
                {userRole.toUpperCase()}
              </span>
            </div>
            <div className="info-row">
              <span className="info-key">Status</span>
              <span className="badge badge-green">● Operational</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}