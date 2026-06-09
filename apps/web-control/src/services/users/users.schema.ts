export interface User {
  id: string
  name: string
  email: string
  role: string | null
  emailVerified: boolean
  createdAt: string
}
