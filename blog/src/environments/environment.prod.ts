export const environment = {
  production: true,
  // Hosted blog: deploy `firestore.rules` at repo root so `tenants/**` reads are allowed.
  useEmulator: false,
  firebaseConfig: {
    apiKey: 'AIzaSyDAR62TZbezrBOZ-nld4oz4DaSlZh82o2k',
    authDomain: 'dougwilliamson-online.firebaseapp.com',
    projectId: 'dougwilliamson-online',
    storageBucket: 'dougwilliamson-online.firebasestorage.app',
    messagingSenderId: '89733015991',
    appId: '1:89733015991:web:cae4dbde6b84fef7bd2032',
  },
};
