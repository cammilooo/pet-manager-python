import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export type PetKind = 'Dog' | 'Cat'
export type HealthStatus = 'Sick' | 'Healthy' | 'In Surgery'

export interface PetRecord {
  id: number
  code: string
  name: string
  born_year: number
  color: string
  health_status: HealthStatus
  breed: string
  kind: PetKind
  pedigree: boolean
}

export interface PetInput {
  code: string
  name: string
  born_year: number
  color: string
  health_status: HealthStatus
  breed: string
  kind: PetKind
  pedigree: boolean
}

const HEALTH_STATUSES: HealthStatus[] = ['Sick', 'Healthy', 'In Surgery']

export function parsePetInput(value: unknown): PetInput | null {
  if (!value || typeof value !== 'object') return null
  const form = value as Record<string, unknown>
  const code = typeof form.code === 'string' ? form.code.trim() : ''
  const name = typeof form.name === 'string' ? form.name.trim() : ''
  const color = typeof form.color === 'string' ? form.color.trim() : ''
  const breed = typeof form.breed === 'string' ? form.breed.trim() : ''
  const bornYear = Number(form.born_year)

  if (
    !code || code.length > 3 ||
    !name || name.length > 50 ||
    !color || color.length > 20 ||
    !breed || breed.length > 30 ||
    !Number.isInteger(bornYear) || bornYear < 1900 || bornYear > new Date().getFullYear() ||
    (form.kind !== 'Dog' && form.kind !== 'Cat') ||
    !HEALTH_STATUSES.includes(form.health_status as HealthStatus)
  ) return null

  return {
    code,
    name,
    color,
    breed,
    born_year: bornYear,
    health_status: form.health_status as HealthStatus,
    kind: form.kind,
    pedigree: form.kind === 'Dog' && form.pedigree === true,
  }
}

export async function listPets(supabase?: SupabaseClient): Promise<PetRecord[]> {
  const client = supabase ?? (await createClient())
  const [petResult, dogResult, catResult] = await Promise.all([
    client.from('tb_pet').select('id, code, name, born_year, color, health_status'),
    client.from('tb_dog').select('id, breed, pedigree, id_pet'),
    client.from('tb_cat').select('id, breed, id_pet'),
  ])

  if (petResult.error) throw petResult.error
  if (dogResult.error) throw dogResult.error
  if (catResult.error) throw catResult.error

  const dogsByPet = new Map<number, { breed: string; pedigree: boolean }>()
  const catsByPet = new Map<number, { breed: string }>()
  for (const dog of dogResult.data ?? []) {
    dogsByPet.set(Number(dog.id_pet), { breed: dog.breed, pedigree: dog.pedigree })
  }
  for (const cat of catResult.data ?? []) {
    catsByPet.set(Number(cat.id_pet), { breed: cat.breed })
  }

  const pets: PetRecord[] = []
  for (const pet of petResult.data ?? []) {
    const id = Number(pet.id)
    const dog = dogsByPet.get(id)
    const cat = catsByPet.get(id)
    const subtype = dog ?? cat
    if (!subtype) continue

    pets.push({
      id,
      code: pet.code,
      name: pet.name,
      born_year: Number(pet.born_year),
      color: pet.color,
      health_status: pet.health_status as HealthStatus,
      breed: subtype.breed,
      kind: dog ? 'Dog' : 'Cat',
      pedigree: dog?.pedigree ?? false,
    })
  }

  return pets.sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code))
}

export async function createPet(input: PetInput, supabase?: SupabaseClient) {
  const client = supabase ?? (await createClient())
  const { data: pet, error: petError } = await client
    .from('tb_pet')
    .insert({
      code: input.code,
      name: input.name,
      born_year: input.born_year,
      color: input.color,
      health_status: input.health_status,
    })
    .select('id')
    .single()
  if (petError) throw petError

  const petId = Number(pet.id)
  try {
    const childError = input.kind === 'Dog'
      ? (await client.from('tb_dog').insert({ breed: input.breed, pedigree: input.pedigree, id_pet: petId })).error
      : (await client.from('tb_cat').insert({ breed: input.breed, id_pet: petId })).error
    if (childError) throw childError
  } catch (error) {
    await client.from('tb_pet').delete().eq('id', petId)
    throw error
  }
}

export async function updatePet(id: number, input: PetInput, supabase?: SupabaseClient) {
  const client = supabase ?? (await createClient())
  const { data: currentPet, error: lookupError } = await client
    .from('tb_pet')
    .select('id')
    .eq('id', id)
    .maybeSingle()
  if (lookupError) throw lookupError
  if (!currentPet) return false

  const { error: petError } = await client
    .from('tb_pet')
    .update({
      code: input.code,
      name: input.name,
      born_year: input.born_year,
      color: input.color,
      health_status: input.health_status,
    })
    .eq('id', id)
  if (petError) throw petError

  if (input.kind === 'Dog') {
    const { data, error } = await client
      .from('tb_dog')
      .update({ breed: input.breed, pedigree: input.pedigree })
      .eq('id_pet', id)
      .select('id')
      .maybeSingle()
    if (error) throw error
    return Boolean(data)
  }

  const { data, error } = await client
    .from('tb_cat')
    .update({ breed: input.breed })
    .eq('id_pet', id)
    .select('id')
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function deletePet(id: number, supabase?: SupabaseClient) {
  const client = supabase ?? (await createClient())
  const { data: currentPet, error: lookupError } = await client
    .from('tb_pet')
    .select('id')
    .eq('id', id)
    .maybeSingle()
  if (lookupError) throw lookupError
  if (!currentPet) return false

  const { error: visitsError } = await client.from('tb_pet_hospital').delete().eq('id_pet', id)
  if (visitsError) throw visitsError

  const { error: petError } = await client.from('tb_pet').delete().eq('id', id)
  if (petError) throw petError
  return true
}
