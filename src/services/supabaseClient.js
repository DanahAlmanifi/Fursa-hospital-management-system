import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://wrtoogpkashtolbehvmt.supabase.co"
const supabaseAnonKey = "sb_publishable_VZG-laVr0rMEFCXFVZIviA_2maRSjrM"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)