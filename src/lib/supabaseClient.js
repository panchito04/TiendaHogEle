import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tyxwdutvujcnktxdxxjs.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5eHdkdXR2dWpjbmt0eGR4eGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyODY1OTEsImV4cCI6MjA3NTg2MjU5MX0.FG99B59V-WHbrCFfUeUYbtvwwaz1VWZp8Ly5aJRz5QY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
