import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://knblquodwssbujrihfhl.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_EoTJU4OcPOuS7LU5s_uKDw_Mh1o5EWr'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
