import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"
import AppLayout from "../components/AppLayout"
import "./patients.css"

const TABLE_NAME = "patient"

function fullName(p) {
    return [p.fname, p.mname, p.lname].filter(Boolean).join(" ") || `Patient #${p.patientid}`
}

export default function PatientsPage() {
    const navigate = useNavigate()
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")

    useEffect(() => {
        async function loadPatients() {
            setLoading(true)
            setError("")

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select("patientid, nationalid, fname, mname, lname, gender, dob, patientphoneno, address")
                .order("patientid", { ascending: true })

            if (error) {
                setError(error.message)
                setPatients([])
            } else {
                setPatients(data || [])
            }

            setLoading(false)
        }

        loadPatients()
    }, [])

    const filtered = patients.filter((p) => {
        const q = search.toLowerCase()
        return (
            String(p.patientid).includes(q) ||
            fullName(p).toLowerCase().includes(q)
        )
    })

    return (
        <AppLayout>
            <div className="patients-page">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <p className="page-sub">Patient Registry</p>
                        <h1>Patients</h1>
                    </div>
                    <div className="header-right">
                        <div className="search-box">
                            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name or ID…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>
                </div>

                {/* Table card */}
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div className="table-header">
                        <span>
                            {!loading && (
                                <span className="badge badge-blue">
                                    {filtered.length} patient{filtered.length !== 1 ? "s" : ""}
                                </span>
                            )}
                        </span>
                    </div>

                    {loading && (
                        <div className="table-loading">
                            <div className="spinner" />
                            <span>Loading patients…</span>
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

                    {!loading && !error && filtered.length === 0 && (
                        <div className="empty-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <h3>{search ? "No patients match your search" : "No patients found"}</h3>
                            <p>{search ? "Try a different name or ID" : "No records in the patient table yet"}</p>
                        </div>
                    )}

                    {!loading && !error && filtered.length > 0 && (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Full Name</th>
                                    <th>Gender</th>
                                    <th>Phone</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p) => {
                                    const name = fullName(p)
                                    return (
                                        <tr key={p.patientid}>
                                            <td>
                                                <span className="patient-id">#{p.patientid}</span>
                                            </td>
                                            <td>
                                                <div className="patient-name-cell">
                                                    <div className="patient-avatar">
                                                        {(p.fname || "P")[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="patient-name">{name}</div>
                                                        {p.dob && (
                                                            <div className="patient-email">
                                                                DOB: {p.dob}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {p.gender ? (
                                                    <span className={`badge ${p.gender.toLowerCase() === "female" ? "badge-purple" : "badge-blue"}`}>
                                                        {p.gender}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                                                {p.patientphoneno || "—"}
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => navigate(`/patients/${p.patientid}`)}
                                                >
                                                    View Profile
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="9 18 15 12 9 6" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}