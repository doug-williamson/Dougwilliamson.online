export const environment = {
  production: false,
  // Use with Firebase emulators (see `admin/package.json` → `npm run emulator` from `admin/`).
  // For production Firestore without emulators, set `false` and deploy repo `firestore.rules`:
  // `firebase deploy --only firestore:rules` (requires project IAM on dougwilliamson-online).
  useEmulator: true,
  firebaseConfig: {
    apiKey: 'AIzaSyDAR62TZbezrBOZ-nld4oz4DaSlZh82o2k',
    authDomain: 'dougwilliamson-online.firebaseapp.com',
    projectId: 'dougwilliamson-online',
    storageBucket: 'dougwilliamson-online.firebasestorage.app',
    messagingSenderId: '89733015991',
    appId: '1:89733015991:web:cae4dbde6b84fef7bd2032',
  },
};
