import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

export default function AuthCallback() {
  const navigate = useNavigate()
  const [msg, setMsg] = useState("Finishing sign-in...")

  useEffect(() => {
    async function finish() {
      try {
        const url = new URL(window.location.href)
        
        // Check for error in hash (from OTP links)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const error = hashParams.get("error")
        const errorCode = hashParams.get("error_code")
        const errorDesc = hashParams.get("error_description")
        
        if (error || errorCode) {
          const msg = errorDesc ? decodeURIComponent(errorDesc) : errorCode || error
          setMsg("Login failed: " + msg + ". Please request a new link.")
          setTimeout(() => navigate("/", { replace: true }), 3000)
          return
        }
        
        const code = url.searchParams.get("code")

        // Supabase magic link often returns with ?code=...
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            setMsg("Login failed: " + error.message)
            return
          }
        }

        // If session exists, go dashboard
        const { data } = await supabase.auth.getSession()
        if (data.session) navigate("/dashboard", { replace: true })
        else setMsg("No session found. Please request a new link.")
      } catch (e) {
        setMsg("Callback error. Please request a new link.")
      }
    }

    finish()
  }, [navigate])

  return <div style={{ padding: 24 }}>{msg}</div>
}