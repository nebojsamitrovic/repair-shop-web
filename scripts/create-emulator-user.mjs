/**
 * Creates a user in the Firebase Auth emulator.
 *
 * The login screen only signs people in — there is no self-registration, because in a real
 * garage accounts arrive through an invitation. Locally that leaves nobody to sign in as, so
 * this puts a user into the emulator directly through its REST API.
 *
 *   node scripts/create-emulator-user.mjs [email] [password]
 *
 * The emulator accepts any API key, and a user created here survives only until it restarts
 * (unless started with --import/--export-on-exit).
 */
import { readFileSync } from 'node:fs'

const readEnv = () => {
    try {
        return Object.fromEntries(
            readFileSync(new URL('../.env', import.meta.url), 'utf8')
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line && !line.startsWith('#'))
                .map((line) => {
                    const index = line.indexOf('=')
                    return [line.slice(0, index), line.slice(index + 1)]
                })
        )
    } catch {
        return {}
    }
}

const env = readEnv()
const host = env.VITE_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099'
const apiKey = env.VITE_FIREBASE_API_KEY || 'demo-key'
const [email = 'marko@servismarko.rs', password = 'lozinka123'] = process.argv.slice(2)

const url = `http://${host}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`

let response
try {
    response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
    })
} catch {
    console.error(`Could not reach the Auth emulator on ${host}. Start it with: npm run emulator`)
    process.exit(1)
}

const body = await response.json()

if (!response.ok) {
    const reason = body?.error?.message ?? response.statusText
    if (reason === 'EMAIL_EXISTS') {
        console.log(`${email} already exists — sign in with it.`)
        process.exit(0)
    }
    console.error(`The emulator refused the request: ${reason}`)
    process.exit(1)
}

console.log(`Created ${email} (password: ${password}).`)
console.log('First sign-in lands on onboarding, which creates the garage with you as OWNER.')
