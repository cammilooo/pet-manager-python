import { createClient } from '@/lib/supabase/server'

export type PetManagerRole = 'admin' | 'staff'

export async function getAuthenticatedClient() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) return null

  const role = data.user.app_metadata?.petmanager_role
  if (role !== 'admin' && role !== 'staff') return null

  return { supabase, user: data.user, role: role as PetManagerRole }
}
