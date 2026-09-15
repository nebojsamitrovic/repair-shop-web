export const config = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
    firebase: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
    },
    firebaseAuthEmulatorHost: import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST ?? '',
} as const
