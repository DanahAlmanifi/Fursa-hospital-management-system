import { useEffect, useState, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../services/supabaseClient"
import AppLayout from "../components/AppLayout"
import ScheduleAppointmentModal from "./ScheduleAppointmentModal"
import AddRecordModal from "./AddRecordModal"
import "./PatientProfile.css"

function fullName(p) {
    if (!p) return ""
    return [p.fname, p.mname, p.lname].filter(Boolean).join(" ") || `Patient #${p.patientid}`
}

export default function PatientProfile() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [patient, setPatient] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [activeTab, setActiveTab] = useState("overview")

    // Auth & Roles
    const [userRole, setUserRole] = useState("user")

    // Appointments
    const [appointments, setAppointments] = useState([])
    const [apptLoading, setApptLoading] = useState(false)
    const [apptError, setApptError] = useState("")
    const [deletingId, setDeletingId] = useState(null)
    const [showModal, setShowModal] = useState(false)

    // Records (Notes & Prescriptions)
    const [records, setRecords] = useState([])
    const [recordsLoading, setRecordsLoading] = useState(false)
    const [recordsError, setRecordsError] = useState("")
    const [showRecordModal, setShowRecordModal] = useState(false)

    // ─── Setup Auth & Role ───────────────────────────────────────
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            const email = data?.session?.user?.email
            if (email) {
                supabase.from("profiles").select("role").eq("email", email).single()
                    .then(({ data: profile }) => {
                        if (profile?.role) setUserRole(profile.role)
                    })
            }
        })
    }, [])

    // ─── Load patient ────────────────────────────────────────────
    useEffect(() => {
        let mounted = true

        async function loadPatient() {
            setLoading(true)
            setError("")

            const { data, error } = await supabase
                .from("patient")                      // ✅ correct table name
                .select("*")
                .eq("patientid", id)                  // ✅ correct primary key
                .single()

            if (!mounted) return

            if (error) {
                setError(error.message)
                setPatient(null)
            } else {
                setPatient(data)
            }

            setLoading(false)
        }

        loadPatient()
        return () => { mounted = false }
    }, [id])

    // ─── Load appointments ───────────────────────────────────────
    const loadAppointments = useCallback(async () => {
        setApptLoading(true)
        setApptError("")

        const { data, error } = await supabase
            .from("appointment")
            .select(`
        appointmentid,
        type,
        status,
        time,
        date,
        doctorid,
        doctor ( docname, specialization )
      `)
            .eq("patientid", id)
            .order("date", { ascending: false })

        if (error) {
            setApptError(error.message)
        } else {
            setAppointments(data || [])
        }

        setApptLoading(false)
    }, [id])

    // Fetch appointments when the Appointments tab is first opened
    useEffect(() => {
        if (activeTab === "appointments") {
            loadAppointments()
        }
    }, [activeTab, loadAppointments])

    // ─── Load Clinical Records ───────────────────────────────────
    const loadRecords = useCallback(async () => {
        setRecordsLoading(true)
        setRecordsError("")

        // medical_record -> doctor_creates_medicalrec -> doctor
        // medical_record -> medications_record
        const { data, error } = await supabase
            .from("medical_record")
            .select(`
                recordid,
                diagnosis,
                dateofcreation,
                doctor_creates_medicalrec ( doctor ( docname, specialization ) ),
                medications_record ( medication )
            `)
            .eq("patientid", id)
            .order("dateofcreation", { ascending: false })

        if (error) {
            setRecordsError(error.message)
        } else {
            setRecords(data || [])
        }
        setRecordsLoading(false)
    }, [id])

    useEffect(() => {
        if (activeTab === "records") {
            loadRecords()
        }
    }, [activeTab, loadRecords])

    // ─── Delete appointment ──────────────────────────────────────
    async function handleDeleteAppointment(appointmentId) {
        if (!window.confirm("Are you sure you want to delete this appointment?")) return

        setDeletingId(appointmentId)
        const { error } = await supabase
            .from("appointment")
            .delete()
            .eq("appointmentid", appointmentId)

        setDeletingId(null)

        if (error) {
            alert("Failed to delete appointment: " + error.message)
        } else {
            // Refresh list
            loadAppointments()
        }
    }

    // ─── Derived display values ──────────────────────────────────
    const displayName = fullName(patient) || `Patient #${id}`
    const initials = displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

    // Fields to show in overview (skip the PK itself)
    const SKIP_KEYS = ["patientid"]
    const detailFields = patient
        ? Object.entries(patient).filter(([k]) => !SKIP_KEYS.includes(k))
        : []

    // Human-readable labels for the schema columns
    const LABELS = {
        nationalid: "National ID",
        patientphoneno: "Phone Number",
        dob: "Date of Birth",
        address: "Address",
        fname: "First Name",
        mname: "Middle Name",
        lname: "Last Name",
        gender: "Gender",
    }

    return (
        <AppLayout>
            <div className="profile-page">
                {loading && (
                    <div className="table-loading">
                        <div className="spinner" />
                        <span>Loading patient #{id}…</span>
                    </div>
                )}

                {error && (
                    <div className="table-error">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {error}
                    </div>
                )}

                {!loading && !error && patient && (
                    <>
                        {/* Back */}
                        <button className="btn btn-ghost btn-sm back-btn" onClick={() => navigate("/patients")}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            Back to Patients
                        </button>

                        {/* Hero */}
                        <div className="profile-hero card">
                            <div className="profile-avatar-lg">{initials}</div>
                            <div className="profile-hero-info">
                                <h1 className="profile-name">{displayName}</h1>
                                <div className="profile-meta">
                                    <span className="badge badge-green">● Active</span>
                                    <span className="profile-id">Patient ID: <strong>#{id}</strong></span>
                                    {patient.gender && (
                                        <span className={`badge ${patient.gender.toLowerCase() === "female" ? "badge-purple" : "badge-blue"}`}>
                                            {patient.gender}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="profile-hero-actions">
                                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    Schedule Appointment
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="profile-tabs-bar">
                            {["overview", "appointments", "records"].map((tab) => (
                                <button
                                    key={tab}
                                    className={"profile-tab" + (activeTab === tab ? " profile-tab--active" : "")}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === "records" ? "Clinical Records" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    {tab === "appointments" && appointments.length > 0 && (
                                        <span className="tab-count">{appointments.length}</span>
                                    )}
                                    {tab === "records" && records.length > 0 && (
                                        <span className="tab-count">{records.length}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* ── Overview ── */}
                        {activeTab === "overview" && (
                            <div className="card">
                                <h2 className="section-heading">Patient Details</h2>
                                {detailFields.length === 0 ? (
                                    <p style={{ color: "var(--text-muted)" }}>No additional details available.</p>
                                ) : (
                                    <div className="details-grid">
                                        {detailFields.map(([key, val]) => (
                                            <div className="detail-item" key={key}>
                                                <span className="detail-key">{LABELS[key] ?? key.replace(/_/g, " ")}</span>
                                                <span className="detail-val">
                                                    {val === null || val === "" ? (
                                                        <em style={{ opacity: 0.4 }}>—</em>
                                                    ) : (
                                                        String(val)
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Appointments ── */}
                        {activeTab === "appointments" && (
                            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                                <div className="table-header">
                                    <span className="badge badge-blue">
                                        {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
                                    </span>
                                    <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                                        + New
                                    </button>
                                </div>

                                {apptLoading && (
                                    <div className="table-loading">
                                        <div className="spinner" />
                                        <span>Loading appointments…</span>
                                    </div>
                                )}

                                {apptError && (
                                    <div className="table-error">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        {apptError}
                                    </div>
                                )}

                                {!apptLoading && !apptError && appointments.length === 0 && (
                                    <div className="empty-state">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                        <h3>No appointments yet</h3>
                                        <p>Schedule the first appointment for this patient</p>
                                    </div>
                                )}

                                {!apptLoading && !apptError && appointments.length > 0 && (
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Time</th>
                                                <th>Type</th>
                                                <th>Doctor</th>
                                                <th>Specialization</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: "right" }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {appointments.map((a) => (
                                                <tr key={a.appointmentid}>
                                                    <td>{a.date ?? "—"}</td>
                                                    <td>{a.time ?? "—"}</td>
                                                    <td>{a.type ?? "—"}</td>
                                                    <td>{a.doctor?.docname ?? "—"}</td>
                                                    <td>
                                                        {a.doctor?.specialization ? (
                                                            <span className="badge badge-purple">{a.doctor.specialization}</span>
                                                        ) : "—"}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${a.status?.toLowerCase() === "completed" ? "badge-green"
                                                            : a.status?.toLowerCase() === "cancelled" ? "badge-red"
                                                                : "badge-amber"
                                                            }`}>
                                                            ● {a.status ?? "Scheduled"}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: "right" }}>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            style={{ color: "var(--red)", padding: "6px 8px" }}
                                                            onClick={() => handleDeleteAppointment(a.appointmentid)}
                                                            disabled={deletingId === a.appointmentid}
                                                            title="Delete Appointment"
                                                        >
                                                            {deletingId === a.appointmentid ? (
                                                                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderColor: "var(--red)", borderTopColor: "transparent" }} />
                                                            ) : (
                                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* ── Clinical Records ── */}
                        {activeTab === "records" && (
                            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                                <div className="table-header">
                                    <span className="badge badge-blue">
                                        {records.length} record{records.length !== 1 ? "s" : ""}
                                    </span>
                                    {userRole === "doctor" && (
                                        <button className="btn btn-primary btn-sm" onClick={() => setShowRecordModal(true)}>
                                            + Add Record
                                        </button>
                                    )}
                                </div>

                                {recordsLoading && (
                                    <div className="table-loading">
                                        <div className="spinner" />
                                        <span>Loading clinical records…</span>
                                    </div>
                                )}

                                {recordsError && (
                                    <div className="table-error">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        {recordsError}
                                    </div>
                                )}

                                {!recordsLoading && !recordsError && records.length === 0 && (
                                    <div className="empty-state">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                            <polyline points="10 9 9 9 8 9" />
                                        </svg>
                                        <h3>No clinical records</h3>
                                        {userRole === "doctor" ? (
                                            <p>Add the first diagnosis and prescription.</p>
                                        ) : (
                                            <p>A doctor hasn't added any notes for this patient.</p>
                                        )}
                                    </div>
                                )}

                                {!recordsLoading && !recordsError && records.length > 0 && (
                                    <div style={{ padding: 20 }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                            {records.map((r) => {
                                                // Extract doctor name safely from join
                                                const creatorObj = r.doctor_creates_medicalrec?.[0]?.doctor;
                                                const docName = creatorObj ? creatorObj.docname : "Unknown Doctor";

                                                return (
                                                    <div key={r.recordid} style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 12 }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                                            <div>
                                                                <strong style={{ display: "block", color: "var(--text)" }}>Date</strong>
                                                                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{r.dateofcreation || "—"}</span>
                                                            </div>
                                                            <div style={{ textAlign: "right" }}>
                                                                <strong style={{ display: "block", color: "var(--text)" }}>Attending Doctor</strong>
                                                                <span className="badge badge-purple" style={{ marginTop: 4 }}>{docName}</span>
                                                            </div>
                                                        </div>

                                                        <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
                                                            <h4 style={{ margin: "0 0 8px 0", color: "var(--text)", fontSize: 14 }}>Diagnosis / Notes</h4>
                                                            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, whiteSpace: "pre-wrap" }}>
                                                                {r.diagnosis || "No notes provided."}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <h4 style={{ margin: "0 0 8px 0", color: "var(--text)", fontSize: 14 }}>Prescriptions</h4>
                                                            {r.medications_record && r.medications_record.length > 0 ? (
                                                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                                    {r.medications_record.map((m, idx) => (
                                                                        <span key={idx} className="badge badge-amber" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                <path d="M10.5 20.5l-6-6a4.5 4.5 0 1 1 6.4-6.4l6 6a4.5 4.5 0 1 1-6.4 6.4z" />
                                                                                <line x1="7.1" y1="13.9" x2="13.1" y2="19.9" />
                                                                            </svg>
                                                                            {m.medication}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>None prescribed.</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {showModal && (
                    <ScheduleAppointmentModal
                        open={showModal}
                        patientId={id}
                        onClose={() => setShowModal(false)}
                        onSchedule={() => {
                            // Refresh the list after a successful insert
                            loadAppointments()
                            setActiveTab("appointments")
                        }}
                    />
                )}

                {showRecordModal && (
                    <AddRecordModal
                        open={showRecordModal}
                        patientId={id}
                        onClose={() => setShowRecordModal(false)}
                        onRecordAdded={() => {
                            loadRecords()
                            setActiveTab("records")
                        }}
                    />
                )}
            </div>
        </AppLayout>
    )
}