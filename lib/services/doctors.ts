import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export interface Doctor {
  id: number
  name: string
  phone: string | null
  address: string | null
}

export interface DoctorInput {
  name: string
  phone: string | null
  address: string | null
}

function optionalText(value: unknown, maxLength = 255): string | null | undefined {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length <= maxLength ? trimmed || null : undefined
}

export function parseDoctorInput(value: unknown): DoctorInput | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Record<string, unknown>
  const name = optionalText(input.name, 120)
  const phone = optionalText(input.phone)
  const address = optionalText(input.address)
  if (!name || phone === undefined || address === undefined) return null
  return { name, phone, address }
}

export async function listDoctors(supabase?: SupabaseClient): Promise<Doctor[]> {
  const client = supabase ?? (await createClient())
  const { data, error } = await client
    .from('tb_doctor')
    .select('id, name, phone, address')
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []).map((doctor) => ({
    id: Number(doctor.id),
    name: doctor.name,
    phone: doctor.phone,
    address: doctor.address,
  }))
}

export async function createDoctor(input: DoctorInput, supabase?: SupabaseClient) {
  const client = supabase ?? (await createClient())
  const { error } = await client.from('tb_doctor').insert(input)
  if (error) throw error
}

export async function updateDoctor(id: number, input: DoctorInput, supabase?: SupabaseClient) {
  const client = supabase ?? (await createClient())
  const { data, error } = await client
    .from('tb_doctor')
    .update(input)
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function deleteDoctor(id: number, supabase?: SupabaseClient) {
  const client = supabase ?? (await createClient())
  const { data, error } = await client
    .from('tb_doctor')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}
