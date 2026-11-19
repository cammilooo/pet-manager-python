export async function fetchJson(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`)
  return response.json()
}
