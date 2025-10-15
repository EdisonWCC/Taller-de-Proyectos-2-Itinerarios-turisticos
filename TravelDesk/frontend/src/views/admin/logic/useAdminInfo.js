import { useMemo } from 'react'

export default function useAdminInfo() {
  // Placeholder: replace with real auth/user context or API call
  const admin = useMemo(
    () => ({
      id: 'admin-1',
      name: 'Admin Demo',
      email: 'admin@example.com',
      role: 'SUPER_ADMIN',
      lastLogin: new Date().toLocaleString(),
    }),
    []
  )

  return { admin }
}
