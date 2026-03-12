import { auth } from '@clerk/nextjs/server'

export async function getCurrentUserRole() {
  const { sessionClaims } = await auth()
  const metadata = sessionClaims?.metadata as { role?: string } | undefined
  return metadata?.role
}