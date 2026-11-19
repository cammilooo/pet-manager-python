import { DirectoryPage } from '@/components/directories'

export const metadata = {
  title: 'Hospitales | Pet Manager',
  description: 'Directorio de hospitales veterinarios.',
}

export default function HospitalsPage() {
  return <DirectoryPage kind="hospitals" />
}
