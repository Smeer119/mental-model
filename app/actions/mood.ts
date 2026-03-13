'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveMood(mood: string, reason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('mood_entries').insert({
    user_id: user.id,
    mood,
    reason,
  })

  if (error) return { error: error.message }

  revalidatePath('/')
  return { success: true }
}
