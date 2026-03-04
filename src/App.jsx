import { Routes, Route, Navigate } from "react-router-dom"
import "./index.css"
import "./App.css"

import LoginPage from "./pages/login.jsx"
import DashboardPage from "./pages/dashboard.jsx"
import PatientPage from "./pages/PatientPage.jsx"
import PatientProfile from "./pages/PatientProfile.jsx"
import AuthCallback from "./pages/AuthCallback.jsx"

import RequireAuth from "./components/RequireAuth.jsx"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />

      <Route
        path="/patients"
        element={
          <RequireAuth>
            <PatientPage />
          </RequireAuth>
        }
      />

      <Route
        path="/patients/:id"
        element={
          <RequireAuth>
            <PatientProfile />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}