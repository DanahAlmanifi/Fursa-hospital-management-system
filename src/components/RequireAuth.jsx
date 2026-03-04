import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabaseClient"

export default function RequireAuth({ children }) {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let mounted = true

    async function check() {
      const { data, error } = await supabase.auth.getSession()
      if (!mounted) return

      if (error || !data?.session) {
        navigate("/login", { replace: true })
      }
      setChecking(false)
    }

    check()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login", { replace: true })
    })

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe()
    }
  }, [navigate])

  if (checking) return null
  return children
}