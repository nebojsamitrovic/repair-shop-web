/** Firebase answers one question — who is calling — and every authorization decision stays server-side. */
import { initializeApp } from 'firebase/app'
import {
    connectAuthEmulator,
    getAuth,
    onIdTokenChanged,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    type User,
} from 'firebase/auth'

import { config } from 'utils/config'

const app = initializeApp(config.firebase)
export const auth = getAuth(app)

if (config.firebaseAuthEmulatorHost) {
    connectAuthEmulator(auth, `http://${config.firebaseAuthEmulatorHost}`, { disableWarnings: true })
}

/** Firebase refreshes an expired token itself, so this is called per request rather than cached. */
export const getIdToken = async (forceRefresh = false): Promise<string | null> => {
    const user = auth.currentUser
    if (!user) return null
    try {
        return await user.getIdToken(forceRefresh)
    } catch {
        return null
    }
}

export const signIn = async (email: string, password: string): Promise<User> => {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
}

export const signOut = async (): Promise<void> => await firebaseSignOut(auth)

export const observeUser = (listener: (user: User | null) => void) => onIdTokenChanged(auth, listener)
