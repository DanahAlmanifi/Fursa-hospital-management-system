import { useState } from "react"
import { supabase } from "../services/supabaseClient"
import "./PatientProfile.css"

export default function AddRecordModal({ open, patientId, onClose, onRecordAdded }) {
    const [diagnosis, setDiagnosis] = useState("")
    const [meds, setMeds] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    if (!open) return null

    async function handleSubmit(e) {
        e.preventDefault()

        if (!diagnosis.trim()) {
            setError("Diagnosis/Notes cannot be empty.")
            return
        }

        setSubmitting(true)
        setError("")

        // 1. Get current doctor ID (since only doctors can see this modal)
        const { data: { session } } = await supabase.auth.getSession()
        const email = session?.user?.email
        if (!email) {
            setError("Not authenticated.")
            setSubmitting(false)
            return
        }

        const { data: doc } = await supabase.from("doctor").select("doctorid").eq("email", email).single()
        if (!doc) {
            setError("Doctor profile not found.")
            setSubmitting(false)
            return
        }
        const doctorId = doc.doctorid

        // 2. Insert into medical_record
        const dateStr = new Date().toISOString().split("T")[0]
        const recordIdToUse = Math.floor(Math.random() * 1000000)

        const { error: mrError } = await supabase.from("medical_record").insert({
            recordid: recordIdToUse,
            diagnosis: diagnosis.trim(),
            dateofcreation: dateStr,
            patientid: patientId
        })

        if (mrError) {
            setError(mrError.message)
            setSubmitting(false)
            return
        }

        // 3. Link doctor to record
        const { error: linkError } = await supabase.from("doctor_creates_medicalrec").insert({
            recordid: recordIdToUse,
            doctorid: doctorId
        })

        if (linkError) {
            setError(linkError.message)
            setSubmitting(false)
            return
        }

        // 4. Insert medications (split by comma)
        const medList = meds.split(",").map(m => m.trim()).filter(Boolean)
        if (medList.length > 0) {
            const medInserts = medList.map(m => ({
                recordid: recordIdToUse,
                medication: m
            }))
            const { error: medsError } = await supabase.from("medications_record").insert(medInserts)
            if (medsError) {
                setError("Warning: Medications failed to save. " + medsError.message)
            }
        }

        setSubmitting(false)
        onRecordAdded()
        onClose()
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <h2 className="modal-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--blue)" }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Add Clinical Record
                </h2>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="field-group">
                        <label>Diagnosis / Clinical Notes *</label>
                        <textarea
                            className="login-input"
                            rows={4}
                            value={diagnosis}
                            onChange={e => setDiagnosis(e.target.value)}
                            placeholder="Enter patient diagnosis, symptoms, or general clinical notes..."
                            required
                            style={{ resize: "vertical", paddingTop: 10 }}
                        />
                    </div>

                    <div className="field-group">
                        <label>Prescriptions (Comma separated)</label>
                        <input
                            type="text"
                            className="login-input"
                            value={meds}
                            onChange={e => setMeds(e.target.value)}
                            placeholder="e.g. Amoxicillin 500mg, Ibuprofen 200mg"
                        />
                        <p className="field-hint" style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                            Leave blank if no medications are prescribed.
                        </p>
                    </div>

                    {error && (
                        <div className="login-error" style={{ marginTop: 0 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <span className="btn-spinner" />
                                    Saving...
                                </>
                            ) : (
                                "Save Record"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
