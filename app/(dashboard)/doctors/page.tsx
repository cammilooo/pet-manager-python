import { DirectoryPage } from '@/components/directories'

export const metadata = {
  title: 'Veterinarios | Pet Manager',
  description: 'Directorio de veterinarios de la clínica.',
}

export default function DoctorsPage() {
  return <DirectoryPage kind="doctors" />
}
