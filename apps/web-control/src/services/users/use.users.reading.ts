import { useState } from 'react'

import type { User } from './users.schema'

export function useUsersReading(initialUsers: User[]): {
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
} {
  const [users, setUsers] = useState<User[]>(initialUsers)
  return { setUsers, users }
}
