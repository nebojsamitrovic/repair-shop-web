/**
 * Holds who is calling and what they may do. Status is derived from Firebase and /auth/me rather
 * than stored, and a 404 USER_NOT_REGISTERED is not a failure but the signal to send the caller to
 * onboarding.
 */
import { useQueryClient } from '@tanstack/react-query'
import type { User } from 'firebase/auth'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { api, setSessionLostHandler } from 'api/client'
import { ErrorCode, toAppError } from 'api/errors'
import type { CurrentUser } from 'api/types'
import { useQuery } from 'hooks'
import { observeUser, signOut as firebaseSignOut } from './firebase'
import { SessionContext, type Session, type SessionStatus } from './session'

const SessionProvider = ({ children }: { children: ReactNode }) => {
    const queryClient = useQueryClient()
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
    const [firebaseSettled, setFirebaseSettled] = useState(false)

    useEffect(
        () =>
            observeUser((next) => {
                setFirebaseUser(next)
                setFirebaseSettled(true)
            }),
        []
    )

    const account = useQuery({
        queryKey: ['auth', 'me', firebaseUser?.uid],
        queryFn: async () => (await api.get<CurrentUser>('/auth/me')).data,
        enabled: firebaseSettled && firebaseUser !== null,
        retry: false,
        staleTime: Infinity,
    })

    const status: SessionStatus = useMemo(() => {
        if (!firebaseSettled) return 'loading'
        if (!firebaseUser) return 'anonymous'
        if (account.isPending) return 'loading'
        if (account.data) return 'ready'

        const error = account.error ? toAppError(account.error) : null
        if (error?.is(ErrorCode.UserNotRegistered)) return 'needs-bootstrap'
        if (error?.is(ErrorCode.AuthNotConfigured)) return 'unavailable'
        return 'anonymous'
    }, [firebaseSettled, firebaseUser, account.isPending, account.data, account.error])

    const signOut = useCallback(async () => {
        await firebaseSignOut()
        queryClient.clear()
    }, [queryClient])

    /* When a token can no longer be refreshed there is nothing left to do but sign out. */
    useEffect(() => {
        setSessionLostHandler(() => void signOut())
    }, [signOut])

    const value = useMemo<Session>(() => {
        const user = account.data ?? null
        const permissions = new Set(user?.permissions ?? [])
        return {
            status,
            user,
            can: (permission: string) => permissions.has(permission),
            canAny: (required: string[]) => required.length === 0 || required.some((p) => permissions.has(p)),
            signOut,
            refresh: async () => {
                await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
            },
        }
    }, [status, account.data, signOut, queryClient])

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export default SessionProvider
