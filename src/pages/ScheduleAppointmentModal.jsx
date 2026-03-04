import { useEffect, useState } from "react"
import { supabase } from "../services/supabaseClient"
import "./PatientProfile.css"

/**
 * Props:
 *  open       – boolean
 *  patientId  – the patientid (from URL param) to associate the appointment with
 *  onClose    – () => void
 *  onSchedule – () => void   called after a successful DB insert so parent can refresh
 */
function ScheduleAppointmentModal({ open, patientId, onClose, onSchedule }) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [type, setType] = useState("")
  const [doctorId, setDoctorId] = useState("")

  const [doctors, setDoctors] = useState([])
  const [doctorsLoading, setDoctorsLoading] = useState(true)
  const [doctorsError, setDoctorsError] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  // Fetch doctors from Supabase when modal opens
  useEffect(() => {
    if (!open) return

    async function loadDoctors() {
      setDoctorsLoading(true)
      setDoctorsError("")

      const { data, error } = await supabase
        .from("doctor")
        .select("doctorid, docname, specialization")
        .order("docname", { ascending: true })

      if (error) {
        setDoctorsError(error.message)
      } else {
        setDoctors(data || [])
        if (data?.length > 0) setDoctorId(String(data[0].doctorid))
      }

      setDoctorsLoading(false)
    }

    loadDoctors()
  }, [open])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError("")

    const { error } = await supabase.from("appointment").insert({
      appointmentid: Math.floor(Math.random() * 1000000), // Makeshift auto-increment
      patientid: patientId,
      doctorid: doctorId,
      date,
      time,
      type,
      status: "Scheduled",
    })

    setSubmitting(false)

    if (error) {
      setSubmitError(error.message)
      return
    }

    // Reset and close
    setDate("")
    setTime("")
    setType("")
    setDoctorId(doctors[0] ? String(doctors[0].doctorid) : "")

    onSchedule?.()   // trigger parent to refresh appointments
    onClose()
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="modal-title">
          <svg
            style={{ marginRight: 8, verticalAlign: "middle" }}
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Schedule Appointment
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>

          {/* Doctor dropdown */}
          <div className="field-group">
            <label>Doctor</label>
            {doctorsLoading ? (
              <div className="table-loading" style={{ padding: "8px 0" }}>
                <div className="spinner" />
                <span>Loading doctors…</span>
              </div>
            ) : doctorsError ? (
              <div className="table-error" style={{ padding: "8px 0", fontSize: "0.85rem" }}>
                {doctorsError}
              </div>
            ) : (
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
                style={{ padding: "10px 14px", width: "100%" }}
              >
                <option value="" disabled>— Select a doctor —</option>
                {doctors.map((d) => (
                  <option key={d.doctorid} value={String(d.doctorid)}>
                    {d.docname}
                    {d.specialization ? ` — ${d.specialization}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date */}
          <div className="field-group">
            <label>Appointment Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{ padding: "10px 14px", width: "100%" }}
            />
          </div>

          {/* Time */}
          <div className="field-group">
            <label>Appointment Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              style={{ padding: "10px 14px", width: "100%" }}
            />
          </div>

          {/* Type */}
          <div className="field-group">
            <label>Appointment Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              style={{ padding: "10px 14px", width: "100%" }}
            >
              <option value="" disabled>— Select type —</option>
              <option value="Consultation">Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Emergency">Emergency</option>
              <option value="Routine Check">Routine Check</option>
              <option value="Lab Results">Lab Results</option>
            </select>
          </div>

          {/* Error */}
          {submitError && (
            <div className="table-error" style={{ padding: "8px 12px", borderRadius: 8, fontSize: "0.85rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {submitError}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || doctorsLoading || !doctorId}
            >
              {submitting ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  Booking…
                </>
              ) : (
                "Confirm Appointment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ScheduleAppointmentModal
