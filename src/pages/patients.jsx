import { useNavigate } from "react-router-dom"

export default function PatientsPage() {
  const navigate = useNavigate()

  // temporary sample patients (until you connect your real DB table)
  const patients = [
    { id: 101, name: "Sara Ahmed" },
    { id: 102, name: "Omar Khalid" },
    { id: 103, name: "Maha Saleh" },
  ]

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 48, margin: "0 0 18px 0" }}>Patients</h1>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "none",
          background: "#444",
          color: "#fff",
          fontWeight: 700,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        Back to Dashboard
      </button>

      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        {patients.map((p) => (
          <div
            key={p.id}
            style={{
              padding: 14,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,.15)",
              background: "rgba(0,0,0,.03)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 800 }}>{p.name}</div>
              <div style={{ opacity: 0.7, fontSize: 13 }}>ID: {p.id}</div>
            </div>

            <button
              onClick={() => alert(`Open patient ${p.id} later`)}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                background: "#6a66ff",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Open
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}