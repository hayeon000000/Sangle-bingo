import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase 환경 변수가 없습니다.\n' +
    '.env 파일에 VITE_SUPABASE_URL 과 VITE_SUPABASE_ANON_KEY 를 설정하세요.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    realtime: {
      params: { eventsPerSecond: 20 },
    },
  }
)