import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'

export interface Hospital {
  id: number
  name: string
  phone: string | null
  address: string | null
  patien_type: number | null
  id_doctor: number | null
}

export interface HospitalInput {
  name: string
  phone: string | null
  address: string | null
  patien_type: number | null
  id_doctor: number | null
}

function optionalText(value: unknown, maxLength = 255): string | null | undefined {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length <= maxLength ? trimmed || null : undefined
}

export function parseHospitalInput(value: unknown): HospitalInput | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Record<string, unknown>
  const name = optionalText(input.name, 120)
  const phone = optionalText(input.phone)
  const address = optionalText(input.address)
  const patientType = input.patien_type === '' || input.patien_type === null ? null : Number(input.patien_type)
  const doctorId = input.id_doctor === '' || input.id_doctor === null ? null : Number(input.id_doctor)

  if (
    !name ||
    phone === undefined ||
    address === undefined ||
    (patientType !== null && (!Number.isInteger(patientType) || patientType < 0 || patientType > 999)) ||
    (doctorId !== null && (!Number.isInteger(doctorId) || doctorId < 1))
  ) return null

  return { name, phone, address, patien_type: patientType, id_doctor: doctorId }
}

export async function listHospitals(supabase?: SupabaseClient): Promise<Hospital[]> {
  const client = supabase ?? createAdminClient()
  const { data, error } = await client
    .from('tb_hospital')
    .select('id, name, phone, address, patien_type, id_doctor')
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []).map((hospital) => ({
    id: Number(hospital.id),
    name: hospital.name,
    phone: hospital.phone,
    address: hospital.address,
    patien_type: hospital.patien_type === null ? null : Number(hospital.patien_type),
    id_doctor: hospital.id_doctor === null ? null : Number(hospital.id_doctor),
  }))
}

export async function createHospital(input: HospitalInput, supabase?: SupabaseClient) {
  const client = supabase ?? createAdminClient()
  const { error } = await client.from('tb_hospital').insert(input)
  if (error) throw error
}

export async function updateHospital(id: number, input: HospitalInput, supabase?: SupabaseClient) {
  const client = supabase ?? createAdminClient()
  const { data, error } = await client
    .from('tb_hospital')
    .update(input)
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function deleteHospital(id: number, supabase?: SupabaseClient) {
  const client = supabase ?? createAdminClient()
  const { error: visitsError } = await client.from('tb_pet_hospital').delete().eq('id_hospital', id)
  if (visitsError) throw visitsError

  const { data, error } = await client
    .from('tb_hospital')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}
