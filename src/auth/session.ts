import { createContext, useContext } from 'react'

import type { CurrentUser } from 'api/types'

export type SessionStatus =
    | 'loading'
    | 'anonymous'
    /** Verified by Firebase, but this identity has no application account yet. */
    | 'needs-bootstrap'
    | 'ready'
    /** The backend has no Firebase credentials, so nobody can authenticate. */
    | 'unavailable'

export interface Session {
    status: SessionStatus
    user: CurrentUser | null
    can: (permission: string) => boolean
    /** Any one of these is enough; an empty list means no permission is required. */
    canAny: (permissions: string[]) => boolean
    signOut: () => Promise<void>
    /** Re-reads /auth/me — call after a role change so the UI stops hiding what is now allowed. */
    refresh: () => Promise<void>
}

export const SessionContext = createContext<Session | null>(null)

export const useSession = (): Session => {
    const session = useContext(SessionContext)
    if (!session) throw new Error('useSession must be used inside a SessionProvider')
    return session
}
